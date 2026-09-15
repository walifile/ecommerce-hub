-- Complete expense CRUD with retry-safe creation and audit timestamps.
alter table public.expenses
  add column if not exists idempotency_key uuid,
  add column if not exists updated_at timestamptz;

-- Existing rows were not necessarily edited; preserve their original audit time.
update public.expenses
set updated_at = created_at
where updated_at is null;

alter table public.expenses
  alter column updated_at set default now(),
  alter column updated_at set not null;

create unique index if not exists idx_expenses_idempotency_key
  on public.expenses(idempotency_key)
  where idempotency_key is not null;

create index if not exists idx_expenses_date_type
  on public.expenses(expense_date desc, expense_type);

create or replace function public.set_expense_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.title := btrim(new.title);
  new.expense_type := lower(btrim(new.expense_type));
  new.amount := round(new.amount, 2);
  if new.expense_date > current_date then
    raise exception 'Expense date cannot be in the future' using errcode = '23514';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before insert or update on public.expenses
  for each row execute function public.set_expense_updated_at();

revoke all on function public.set_expense_updated_at() from public, anon, authenticated;
revoke all on public.expenses from anon, authenticated;

notify pgrst, 'reload schema';
