-- Admins may delete an order from the panel, for example a test order that
-- contains personal data. Its items go away through the cascade on the
-- order_items foreign key.

create policy "admins delete orders" on orders for delete using (is_admin());
grant delete on orders to authenticated;
