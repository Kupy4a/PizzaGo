-- PizzaGo database schema for Supabase (PostgreSQL).
-- Product ids are text so they match the static catalog in lib/menu.ts.

create table categories (
  id text primary key,
  name text not null,
  slug text not null unique
);

create table products (
  id text primary key,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  category_id text not null references categories (id),
  is_available boolean not null default true
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  total_price integer not null check (total_price >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'delivered', 'cancelled')),
  customer jsonb not null,
  address jsonb not null,
  payment_method text not null,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id text not null references products (id),
  quantity integer not null check (quantity > 0),
  price_at_purchase integer not null check (price_at_purchase >= 0)
);

-- Users listed here can see and update every order.
-- Grant access with: insert into admins (user_id) select id from auth.users where email = '...';
create table admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create function is_admin() returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admins enable row level security;

create policy "menu is public" on categories for select using (true);
create policy "products are public" on products for select using (true);

-- Guests create orders without an owner; signed-in users can only attach their own id.
create policy "create order" on orders for insert
  with check (user_id is null or user_id = auth.uid());
create policy "read own orders or all as admin" on orders for select
  using (user_id = auth.uid() or is_admin());
create policy "admins update orders" on orders for update
  using (is_admin()) with check (is_admin());

create policy "add order items" on order_items for insert with check (true);
-- The subquery goes through the orders policy, so only visible orders qualify.
create policy "read items of visible orders" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id));

create policy "see own admin row" on admins for select using (user_id = auth.uid());

-- Seed data. The storefront renders names from lib/menu.ts (English and Russian);
-- these rows exist so order_items can reference products.
insert into categories (id, name, slug) values
  ('1', 'Pizza', 'pizza'),
  ('2', 'Desserts', 'desserts'),
  ('3', 'Drinks', 'drinks');

insert into products (id, name, description, price, category_id) values
  ('p1', 'Margherita', 'Classic pizza with tomato sauce, mozzarella and fresh basil', 499, '1'),
  ('p2', 'Pepperoni', 'Spicy pepperoni, mozzarella, tomato sauce and oregano', 599, '1'),
  ('p3', 'Four Cheese', 'Mozzarella, gorgonzola, parmesan and emmental on a cream base', 699, '1'),
  ('p4', 'Hawaiian', 'Ham, pineapple, mozzarella and tomato sauce', 549, '1'),
  ('d1', 'Tiramisu', 'Classic Italian dessert with mascarpone and coffee', 349, '2'),
  ('d2', 'Cheesecake', 'New York cheesecake with berry sauce', 399, '2'),
  ('d3', 'Napoleon', 'Layered puff pastry cake with custard', 299, '2'),
  ('dr1', 'Cola', 'Classic cola, 0.5 L', 149, '3'),
  ('dr2', 'Lemonade', 'Homemade mint lemonade, 0.5 L', 199, '3'),
  ('dr3', 'Cranberry Mors', 'Cranberry berry drink, 0.5 L', 179, '3');
