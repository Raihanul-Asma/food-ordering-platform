-- Food Ordering Platform — MVP schema for Supabase
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query

-- ---------------------------------------------------------------------------
-- Extensions & enums
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'restaurant_owner', 'admin');

create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled'
);

create type public.payment_status as enum (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: auto-update updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles (linked to Supabase Auth)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. restaurants
-- ---------------------------------------------------------------------------

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  name text not null,
  description text,
  image_url text,

  address text not null,
  city text not null default 'Trichy',
  category text,

  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index restaurants_owner_id_idx on public.restaurants (owner_id);
create index restaurants_is_active_idx on public.restaurants (is_active);

create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. menu_items
-- ---------------------------------------------------------------------------

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index menu_items_restaurant_id_idx on public.menu_items (restaurant_id);
create index menu_items_is_available_idx on public.menu_items (is_available);

create trigger menu_items_set_updated_at
before update on public.menu_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. cart_items
-- ---------------------------------------------------------------------------

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, menu_item_id)
);

create index cart_items_user_id_idx on public.cart_items (user_id);

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  restaurant_id uuid not null references public.restaurants (id) on delete restrict,
  status public.order_status not null default 'pending',
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  delivery_address text not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index orders_customer_id_idx on public.orders (customer_id);
create index orders_restaurant_id_idx on public.orders (restaurant_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. order_items (line-item snapshot at checkout)
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  item_name text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- 7. payments
-- ---------------------------------------------------------------------------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  status public.payment_status not null default 'pending',
  payment_method text not null default 'cash',
  provider_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index payments_status_idx on public.payments (status);

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security (minimal MVP policies)
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.menu_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- profiles: users read/update their own row
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- restaurants & menu: public read for active listings
create policy "Anyone can view active restaurants"
on public.restaurants for select
using (is_active = true);

create policy "Owners can manage their restaurants"
on public.restaurants for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Anyone can view available menu items"
on public.menu_items for select
using (
  is_available = true
  and exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.is_active = true
  )
);

create policy "Owners can manage their menu items"
on public.menu_items for all
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.restaurants r
    where r.id = menu_items.restaurant_id
      and r.owner_id = auth.uid()
  )
);

-- cart: customer owns their cart
create policy "Users manage own cart"
on public.cart_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- orders: customers see their orders; restaurant owners see incoming orders
create policy "Customers view own orders"
on public.orders for select
using (auth.uid() = customer_id);

create policy "Customers create own orders"
on public.orders for insert
with check (auth.uid() = customer_id);

create policy "Restaurant owners view restaurant orders"
on public.orders for select
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = orders.restaurant_id
      and r.owner_id = auth.uid()
  )
);

create policy "Restaurant owners update order status"
on public.orders for update
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = orders.restaurant_id
      and r.owner_id = auth.uid()
  )
);

-- order_items: visible if user can see the parent order
create policy "View order items for accessible orders"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (
        o.customer_id = auth.uid()
        or exists (
          select 1
          from public.restaurants r
          where r.id = o.restaurant_id
            and r.owner_id = auth.uid()
        )
      )
  )
);

create policy "Customers insert order items for own orders"
on public.order_items for insert
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.customer_id = auth.uid()
  )
);

-- payments: customer + restaurant owner can view; customer creates
create policy "View payments for accessible orders"
on public.payments for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and (
        o.customer_id = auth.uid()
        or exists (
          select 1
          from public.restaurants r
          where r.id = o.restaurant_id
            and r.owner_id = auth.uid()
        )
      )
  )
);

create policy "Customers create payments for own orders"
on public.payments for insert
with check (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and o.customer_id = auth.uid()
  )
);
