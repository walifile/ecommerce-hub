create or replace function public.update_order_status_with_inventory(
  p_order_id uuid,
  p_status text,
  p_reason text default null,
  p_refund_amount numeric default null,
  p_note text default null
)
returns table (
  order_id uuid,
  order_number text,
  customer_name text,
  customer_phone text,
  total numeric,
  previous_status text,
  new_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_customer_name text;
  v_customer_phone text;
  v_status text := lower(trim(coalesce(p_status, '')));
  v_previous_status text;
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_refund_amount numeric := case
    when p_refund_amount is null then null
    else greatest(0, p_refund_amount)
  end;
  v_item record;
begin
  if v_status = '' then
    raise exception 'Order status is required' using errcode = '22023';
  end if;

  if v_status not in (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned'
  ) then
    raise exception 'Unsupported order status: %', p_status using errcode = '22023';
  end if;

  select *
    into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;

  v_previous_status := v_order.status;

  select coalesce(c.name, 'there'), c.phone
    into v_customer_name, v_customer_phone
  from public.customers c
  where c.id = v_order.customer_id;

  if v_previous_status <> v_status then
    if v_previous_status not in ('cancelled', 'returned')
      and v_status in ('cancelled', 'returned') then
      for v_item in
        select product_id, quantity
        from public.order_items
        where order_id = p_order_id
          and product_id is not null
      loop
        update public.products p
          set stock_quantity = p.stock_quantity + v_item.quantity
        where p.id = v_item.product_id;
      end loop;
    elsif v_previous_status in ('cancelled', 'returned')
      and v_status not in ('cancelled', 'returned') then
      if exists (
        select 1
        from public.order_items oi
        join public.products p on p.id = oi.product_id
        where oi.order_id = p_order_id
          and oi.product_id is not null
          and p.stock_quantity < oi.quantity
      ) then
        raise exception 'Insufficient stock to reopen order %', v_order.order_number
          using errcode = '23514';
      end if;

      for v_item in
        select product_id, quantity
        from public.order_items
        where order_id = p_order_id
          and product_id is not null
      loop
        update public.products p
          set stock_quantity = p.stock_quantity - v_item.quantity
        where p.id = v_item.product_id;
      end loop;
    end if;

    update public.orders
      set status = v_status,
          reversal_reason = case when v_status in ('cancelled', 'returned') then v_reason else reversal_reason end,
          refund_amount = case when v_status in ('cancelled', 'returned') then v_refund_amount else refund_amount end,
          reversal_note = case when v_status in ('cancelled', 'returned') then v_note else reversal_note end,
          reversed_at = case when v_status in ('cancelled', 'returned') then now() else reversed_at end
    where id = p_order_id;

    insert into public.order_events (
      order_id,
      previous_status,
      new_status,
      reason,
      refund_amount,
      note
    )
    values (
      p_order_id,
      v_previous_status,
      v_status,
      v_reason,
      v_refund_amount,
      v_note
    );
  end if;

  return query
    select
      v_order.id,
      v_order.order_number,
      coalesce(v_customer_name, 'there'),
      v_customer_phone,
      v_order.total,
      v_previous_status,
      v_status;
end;
$$;
