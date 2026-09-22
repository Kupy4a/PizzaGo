-- New Supabase projects no longer expose tables to the Data API automatically,
-- so grant exactly what the app needs. Row-level security still decides which
-- rows each role can see or change.

grant usage on schema public to anon, authenticated;

grant select on categories, products to anon, authenticated;

-- Guests place orders; signed-in users also read their own and admins update status.
grant insert on orders, order_items to anon, authenticated;
grant select on orders, order_items to authenticated;
grant update (status) on orders to authenticated;

grant select on admins to authenticated;
grant execute on function is_admin() to anon, authenticated;
