-- Reliable, idempotent WhatsApp delivery tracking and webhook reconciliation.
alter table public.whatsapp_logs
  add column if not exists request_key text,
  add column if not exists meta_message_id text,
  add column if not exists error_code text,
  add column if not exists error_message text,
  add column if not exists attempt_count integer not null default 1,
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.whatsapp_logs
set request_key = 'legacy:' || id::text
where request_key is null;

alter table public.whatsapp_logs
  alter column request_key set not null,
  drop constraint if exists whatsapp_logs_status_valid,
  add constraint whatsapp_logs_status_valid check (
    status in ('queued','accepted','sent','delivered','read','failed','simulated','skipped','configuration_error')
  ) not valid,
  drop constraint if exists whatsapp_logs_attempt_count_valid,
  add constraint whatsapp_logs_attempt_count_valid check (attempt_count > 0) not valid;

create unique index if not exists whatsapp_logs_request_key_unique
  on public.whatsapp_logs(request_key);
create unique index if not exists whatsapp_logs_meta_message_id_unique
  on public.whatsapp_logs(meta_message_id) where meta_message_id is not null;
create index if not exists whatsapp_logs_status_created_idx
  on public.whatsapp_logs(status, created_at desc);

create or replace function public.claim_whatsapp_notification(
  p_request_key text,
  p_order_id uuid,
  p_template_name text,
  p_phone text,
  p_force boolean default false
)
returns table(log_id uuid, should_send boolean)
language plpgsql security definer set search_path = public as $$
declare existing public.whatsapp_logs%rowtype;
declare claimed_id uuid;
begin
  if nullif(btrim(p_request_key), '') is null then
    raise exception 'Request key is required' using errcode = '22023';
  end if;

  select * into existing
  from public.whatsapp_logs
  where request_key = p_request_key
  for update;

  if found then
    if p_force and (
      existing.status in ('failed','simulated','skipped','configuration_error')
      or (existing.status = 'queued' and existing.updated_at < now() - interval '5 minutes')
    ) then
      update public.whatsapp_logs set
        status = 'queued', phone = p_phone, sent_at = null,
        delivered_at = null, read_at = null, meta_message_id = null,
        error_code = null, error_message = null,
        attempt_count = attempt_count + 1, updated_at = now()
      where id = existing.id;
      return query select existing.id, true;
    end if;
    return query select existing.id, false;
    return;
  end if;

  insert into public.whatsapp_logs(order_id, template_name, phone, status, request_key, attempt_count, updated_at)
  values(p_order_id, p_template_name, p_phone, 'queued', p_request_key, 1, now())
  returning id into claimed_id;
  return query select claimed_id, true;
end;
$$;

create or replace function public.apply_whatsapp_delivery_status(
  p_message_id text,
  p_status text,
  p_occurred_at timestamptz,
  p_error_code text default null,
  p_error_message text default null
)
returns void language plpgsql security definer set search_path = public as $$
declare current_status text;
declare current_rank integer;
declare incoming_rank integer;
begin
  if p_status not in ('sent','delivered','read','failed') then return; end if;
  select status into current_status from public.whatsapp_logs
    where meta_message_id = p_message_id for update;
  if not found then return; end if;

  current_rank := case current_status when 'accepted' then 1 when 'sent' then 2 when 'delivered' then 3 when 'read' then 4 else 0 end;
  incoming_rank := case p_status when 'sent' then 2 when 'delivered' then 3 when 'read' then 4 else 0 end;
  if p_status <> 'failed' and incoming_rank < current_rank then return; end if;
  if p_status = 'failed' and current_status in ('delivered','read') then return; end if;

  update public.whatsapp_logs set
    status = p_status,
    sent_at = case when p_status = 'sent' then coalesce(sent_at, p_occurred_at) else sent_at end,
    delivered_at = case when p_status = 'delivered' then coalesce(delivered_at, p_occurred_at) else delivered_at end,
    read_at = case when p_status = 'read' then coalesce(read_at, p_occurred_at) else read_at end,
    error_code = p_error_code,
    error_message = left(p_error_message, 500),
    updated_at = now()
  where meta_message_id = p_message_id;
end;
$$;

revoke all on function public.claim_whatsapp_notification(text,uuid,text,text,boolean) from public, anon, authenticated;
grant execute on function public.claim_whatsapp_notification(text,uuid,text,text,boolean) to service_role;
revoke all on function public.apply_whatsapp_delivery_status(text,text,timestamptz,text,text) from public, anon, authenticated;
grant execute on function public.apply_whatsapp_delivery_status(text,text,timestamptz,text,text) to service_role;
revoke all on public.whatsapp_logs from anon, authenticated;

notify pgrst, 'reload schema';
