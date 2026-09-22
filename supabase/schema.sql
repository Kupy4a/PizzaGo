-- PizzaGo database schema for Supabase (PostgreSQL).
-- Product ids are text so they match the static catalog in lib/menu.ts.

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  image_url text not null default ''
);

create table if not exists products (
  id text primary key,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  category_id text not null references categories (id),
  image_url text not null default '',
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  image_url text not null,
  link_url text not null default '#menu',
  "order" integer not null default 0
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  total_price integer not null check (total_price >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'delivered', 'cancelled')),
  customer jsonb not null,
  address jsonb not null,
  payment_method text not null,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id text not null references products (id),
  quantity integer not null check (quantity > 0),
  price_at_purchase integer not null check (price_at_purchase >= 0)
);

-- Anonymous visitors may read the menu and place orders, but not read orders.
alter table categories enable row level security;
alter table products enable row level security;
alter table banners enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "menu is public" on categories for select using (true);
create policy "products are public" on products for select using (true);
create policy "banners are public" on banners for select using (true);
create policy "anyone can create an order" on orders for insert with check (true);
create policy "anyone can add order items" on order_items for insert with check (true);

insert into categories (id, name, slug) values
  ('1', 'Пицца', 'pizza'),
  ('2', 'Десерты', 'desserts'),
  ('3', 'Напитки', 'drinks')
on conflict (id) do nothing;

insert into products (id, name, description, price, category_id) values
  ('p1', 'Маргарита', 'Классическая пицца с томатным соусом, моцареллой и свежим базиликом', 499, '1'),
  ('p2', 'Пепперони', 'Острая пепперони, моцарелла, томатный соус и орегано', 599, '1'),
  ('p3', 'Четыре сыра', 'Моцарелла, горгонзола, пармезан и эмменталь на сливочном соусе', 699, '1'),
  ('p4', 'Гавайская', 'Ветчина, ананас, моцарелла и томатный соус', 549, '1'),
  ('d1', 'Тирамису', 'Классический итальянский десерт с маскарпоне и кофе', 349, '2'),
  ('d2', 'Чизкейк', 'Нью-йоркский чизкейк с ягодным соусом', 399, '2'),
  ('d3', 'Наполеон', 'Слоёный торт с заварным кремом', 299, '2'),
  ('dr1', 'Кола', 'Классическая кола 0,5 л', 149, '3'),
  ('dr2', 'Лимонад', 'Домашний лимонад с мятой 0,5 л', 199, '3'),
  ('dr3', 'Морс', 'Клюквенный морс 0,5 л', 179, '3')
on conflict (id) do nothing;
