-- Protect the accounting inputs used by profit reporting.
alter table public.orders
  drop constraint if exists orders_accounting_values_nonnegative,
  add constraint orders_accounting_values_nonnegative check (
    coalesce(revenue, 0) >= 0
    and coalesce(total, 0) >= 0
    and coalesce(shipping_cost, 0) >= 0
    and coalesce(ad_cost, 0) >= 0
    and coalesce(discount_amount, 0) >= 0
    and (refund_amount is null or refund_amount between 0 and greatest(revenue, total))
  ) not valid;

alter table public.order_items
  drop constraint if exists order_items_accounting_values_valid,
  add constraint order_items_accounting_values_valid check (
    quantity > 0 and unit_price >= 0 and product_cost >= 0
  ) not valid;

alter table public.expenses
  drop constraint if exists expenses_amount_positive,
  add constraint expenses_amount_positive check (amount > 0) not valid,
  drop constraint if exists expenses_type_valid,
  add constraint expenses_type_valid check (
    expense_type in ('advertising', 'shipping', 'salary', 'miscellaneous')
  ) not valid,
  drop constraint if exists expenses_title_length,
  add constraint expenses_title_length check (
    char_length(btrim(title)) between 1 and 120
  ) not valid;

notify pgrst, 'reload schema';
