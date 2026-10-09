-- Orders are no longer inserted row by row from the browser. A single
-- security-definer function builds the whole order, prices it from the
-- products table and rate-limits how many orders one visitor may place.
-- Only the server may call it (service_role), so the limit can't be skipped
-- by talking to the Data API directly with the public key.

alter table orders add column client_hash text;
create index orders_client_hash_idx on orders (client_hash, created_at);

create function create_order(
  p_customer jsonb,
  p_address jsonb,
  p_payment text,
  p_items jsonb,
  p_client text default null,
  p_user_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  max_per_hour constant integer := 10;
  max_quantity constant integer := 50;
  v_order_id uuid := gen_random_uuid();
  v_total integer := 0;
  v_recent integer;
  v_item jsonb;
  v_product_id text;
  v_price integer;
  v_quantity integer;
begin
  if p_payment is null or p_payment not in ('card', 'card_on_delivery', 'cash') then
    raise exception 'invalid_payment';
  end if;

  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 100 then
    raise exception 'cart_empty';
  end if;

  if p_client is not null then
    select count(*) into v_recent
      from orders
     where client_hash = p_client
       and created_at > now() - interval '1 hour';
    if v_recent >= max_per_hour then
      raise exception 'rate_limited';
    end if;
  end if;

  insert into orders (id, user_id, total_price, status, customer, address, payment_method, client_hash)
  values (v_order_id, coalesce(p_user_id, auth.uid()), 0, 'pending',
          p_customer, p_address, p_payment, p_client);

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_product_id := v_item ->> 'productId';
    v_quantity := nullif(v_item ->> 'quantity', '')::integer;

    if v_quantity is null or v_quantity < 1 or v_quantity > max_quantity then
      raise exception 'invalid_quantity';
    end if;

    -- The price always comes from the catalog, never from the request.
    select price into v_price from products where id = v_product_id and is_available;
    if v_price is null then
      raise exception 'product_unavailable';
    end if;

    insert into order_items (order_id, product_id, quantity, price_at_purchase)
    values (v_order_id, v_product_id, v_quantity, v_price);

    v_total := v_total + v_price * v_quantity;
  end loop;

  update orders set total_price = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- Nothing but the server writes orders now.
drop policy "create order" on orders;
drop policy "add order items" on order_items;
revoke insert on orders, order_items from anon, authenticated;
revoke execute on function create_order(jsonb, jsonb, text, jsonb, text, uuid) from public, anon, authenticated;
grant execute on function create_order(jsonb, jsonb, text, jsonb, text, uuid) to service_role;
