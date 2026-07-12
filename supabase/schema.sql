-- ============================================================
-- Scrap Yard Manager - Supabase Schema
-- Run this whole file in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- Suppliers (ගෙනාපු කෙනා)
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- Item types (Iron, Tin, Wire, CPU, etc.) - admin controlled
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  default_rate numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Loads = one lorry/pickup drop-off = one transaction
create table if not exists loads (
  id uuid primary key default gen_random_uuid(),
  load_number serial,
  load_date date not null default current_date,
  supplier_id uuid not null references suppliers(id) on delete restrict,
  total_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  balance numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Line items within a load
create table if not exists load_items (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references loads(id) on delete cascade,
  item_id uuid not null references items(id) on delete restrict,
  weight numeric(12,2) not null,
  rate numeric(12,2) not null,
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- Stock: running total per item (auto-maintained, never edited manually)
create table if not exists stock (
  item_id uuid primary key references items(id) on delete cascade,
  total_weight numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

-- Optional: daily stock movement log, useful for date-wise stock charts
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  load_id uuid references loads(id) on delete cascade,
  movement_date date not null default current_date,
  weight_change numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Auto-calc trigger: keep loads.total_amount / balance in sync
-- with its load_items, and keep stock in sync automatically.
-- This means the app NEVER manually writes to `stock` or the
-- load totals directly - the DB guarantees correctness.
-- ============================================================

create or replace function recalc_load_totals(p_load_id uuid)
returns void as $$
declare
  v_total numeric(12,2);
  v_paid numeric(12,2);
begin
  select coalesce(sum(subtotal), 0) into v_total
  from load_items where load_id = p_load_id;

  select paid_amount into v_paid from loads where id = p_load_id;

  update loads
  set total_amount = v_total,
      balance = v_total - coalesce(v_paid, 0)
  where id = p_load_id;
end;
$$ language plpgsql;

create or replace function on_load_item_change()
returns trigger as $$
declare
  v_item_id uuid;
  v_load_id uuid;
  v_weight_delta numeric(12,2);
begin
  if tg_op = 'DELETE' then
    v_item_id := old.item_id;
    v_load_id := old.load_id;
    v_weight_delta := -old.weight;
  elsif tg_op = 'INSERT' then
    v_item_id := new.item_id;
    v_load_id := new.load_id;
    v_weight_delta := new.weight;
  else -- UPDATE
    v_item_id := new.item_id;
    v_load_id := new.load_id;
    v_weight_delta := new.weight - old.weight;
  end if;

  -- keep stock in sync
  insert into stock (item_id, total_weight)
  values (v_item_id, greatest(v_weight_delta, 0))
  on conflict (item_id)
  do update set total_weight = stock.total_weight + v_weight_delta,
                updated_at = now();

  if v_weight_delta <> 0 then
    insert into stock_movements (item_id, load_id, weight_change)
    values (v_item_id, v_load_id, v_weight_delta);
  end if;

  -- keep load totals in sync
  perform recalc_load_totals(v_load_id);

  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_load_item_change on load_items;
create trigger trg_load_item_change
after insert or update or delete on load_items
for each row execute function on_load_item_change();

-- Keep balance in sync if paid_amount is edited directly on a load
create or replace function on_load_paid_change()
returns trigger as $$
begin
  new.balance := new.total_amount - new.paid_amount;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_load_paid_change on loads;
create trigger trg_load_paid_change
before update of paid_amount on loads
for each row execute function on_load_paid_change();

-- ============================================================
-- Seed a starter set of item types (safe to edit/remove later
-- from Settings > Item Management in the app)
-- ============================================================
insert into items (name, default_rate, active) values
  ('Iron (යකඩ)', 85, true),
  ('Tin (තകර)', 60, true),
  ('Wire (වයර්)', 150, true),
  ('CPU', 300, true),
  ('Aluminium', 350, true),
  ('Copper', 1500, true),
  ('Battery', 120, true)
on conflict do nothing;

-- ============================================================
-- Row Level Security
-- This app has a single Owner/admin role using Supabase Auth.
-- Any authenticated user (i.e. the logged-in owner) can read/write.
-- ============================================================
alter table suppliers enable row level security;
alter table items enable row level security;
alter table loads enable row level security;
alter table load_items enable row level security;
alter table stock enable row level security;
alter table stock_movements enable row level security;

create policy "authenticated read/write suppliers" on suppliers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write items" on items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write loads" on loads
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write load_items" on load_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write stock" on stock
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write stock_movements" on stock_movements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Helpful indexes
-- ============================================================
create index if not exists idx_loads_supplier on loads(supplier_id);
create index if not exists idx_loads_date on loads(load_date);
create index if not exists idx_load_items_load on load_items(load_id);
create index if not exists idx_load_items_item on load_items(item_id);
create index if not exists idx_stock_movements_date on stock_movements(movement_date);
-- ============================================================
-- ScrapYard: Business Expenses + Sell Stock (resell to factory)
-- Run this ENTIRE file in Supabase Dashboard > SQL Editor > New query.
-- Safe to run once on top of your existing schema.sql - it only
-- ADDS new tables/columns, it does not touch your existing data.
-- ============================================================

-- ---------------------------------------------------------
-- 1. Business Expenses (wages, transport, rent, advances, etc.)
-- ---------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category text not null default 'Other',
  amount numeric(12,2) not null,
  note text,
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;
create policy "authenticated read/write expenses" on expenses
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists idx_expenses_date on expenses(expense_date);

-- ---------------------------------------------------------
-- 2. Track average purchase cost per item (for profit calc)
-- ---------------------------------------------------------
alter table stock add column if not exists avg_cost_rate numeric(12,2) not null default 0;

-- Recomputes the true average cost per kg for an item, based on
-- ALL load_items ever recorded for it (lifetime weighted average).
-- This stays correct no matter how loads are added/edited/deleted.
create or replace function recompute_stock_avg_cost(p_item_id uuid)
returns void as $$
declare
  v_total_weight numeric(14,2);
  v_total_cost numeric(16,2);
begin
  select coalesce(sum(weight), 0), coalesce(sum(weight * rate), 0)
  into v_total_weight, v_total_cost
  from load_items where item_id = p_item_id;

  update stock
  set avg_cost_rate = case when v_total_weight > 0 then v_total_cost / v_total_weight else 0 end
  where item_id = p_item_id;
end;
$$ language plpgsql;

-- Hook the avg-cost recompute into the existing load_items trigger
create or replace function on_load_item_change()
returns trigger as $$
declare
  v_item_id uuid;
  v_load_id uuid;
  v_weight_delta numeric(12,2);
begin
  if tg_op = 'DELETE' then
    v_item_id := old.item_id;
    v_load_id := old.load_id;
    v_weight_delta := -old.weight;
  elsif tg_op = 'INSERT' then
    v_item_id := new.item_id;
    v_load_id := new.load_id;
    v_weight_delta := new.weight;
  else -- UPDATE
    v_item_id := new.item_id;
    v_load_id := new.load_id;
    v_weight_delta := new.weight - old.weight;
  end if;

  insert into stock (item_id, total_weight)
  values (v_item_id, greatest(v_weight_delta, 0))
  on conflict (item_id)
  do update set total_weight = stock.total_weight + v_weight_delta,
                updated_at = now();

  if v_weight_delta <> 0 then
    insert into stock_movements (item_id, load_id, weight_change)
    values (v_item_id, v_load_id, v_weight_delta);
  end if;

  perform recalc_load_totals(v_load_id);
  perform recompute_stock_avg_cost(v_item_id);

  return null;
end;
$$ language plpgsql;

-- ---------------------------------------------------------
-- 3. Sales (selling aggregated stock onward, e.g. to a factory)
-- ---------------------------------------------------------
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  sale_number serial,
  sale_date date not null default current_date,
  buyer_name text not null,
  buyer_phone text,
  total_amount numeric(12,2) not null default 0,
  total_profit numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  item_id uuid not null references items(id) on delete restrict,
  weight numeric(12,2) not null,
  rate numeric(12,2) not null,          -- sell price per kg
  cost_rate numeric(12,2) not null default 0,  -- snapshot of avg purchase cost per kg at time of sale
  subtotal numeric(12,2) not null,
  profit numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table stock_movements add column if not exists sale_id uuid references sales(id) on delete cascade;

-- Before a sale_item is inserted: snapshot the current avg cost,
-- and compute subtotal/profit server-side so the app never has to.
create or replace function set_sale_item_cost()
returns trigger as $$
declare
  v_available numeric(14,2);
  v_avg_cost numeric(12,2);
begin
  select total_weight, avg_cost_rate into v_available, v_avg_cost
  from stock where item_id = new.item_id;

  v_available := coalesce(v_available, 0);
  v_avg_cost := coalesce(v_avg_cost, 0);

  if new.weight > v_available then
    raise exception 'Not enough stock: only % kg available for this item', v_available;
  end if;

  new.cost_rate := v_avg_cost;
  new.subtotal := round(new.weight * new.rate, 2);
  new.profit := round(new.subtotal - (new.weight * v_avg_cost), 2);

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sale_item_cost on sale_items;
create trigger trg_sale_item_cost
before insert on sale_items
for each row execute function set_sale_item_cost();

-- After a sale_item changes: reduce stock, log the movement, and
-- keep the parent sale's total_amount/total_profit in sync.
create or replace function on_sale_item_change()
returns trigger as $$
declare
  v_item_id uuid;
  v_sale_id uuid;
  v_weight_delta numeric(12,2);
  v_total numeric(12,2);
  v_profit numeric(12,2);
begin
  if tg_op = 'DELETE' then
    v_item_id := old.item_id;
    v_sale_id := old.sale_id;
    v_weight_delta := old.weight;   -- selling less again = restore stock
  elsif tg_op = 'INSERT' then
    v_item_id := new.item_id;
    v_sale_id := new.sale_id;
    v_weight_delta := new.weight;
  else
    v_item_id := new.item_id;
    v_sale_id := new.sale_id;
    v_weight_delta := new.weight - old.weight;
  end if;

  update stock
  set total_weight = total_weight - v_weight_delta,
      updated_at = now()
  where item_id = v_item_id;

  if v_weight_delta <> 0 then
    insert into stock_movements (item_id, sale_id, weight_change)
    values (v_item_id, v_sale_id, -v_weight_delta);
  end if;

  select coalesce(sum(subtotal), 0), coalesce(sum(profit), 0)
  into v_total, v_profit
  from sale_items where sale_id = v_sale_id;

  update sales
  set total_amount = v_total,
      total_profit = v_profit
  where id = v_sale_id;

  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_sale_item_change on sale_items;
create trigger trg_sale_item_change
after insert or update or delete on sale_items
for each row execute function on_sale_item_change();

alter table sales enable row level security;
alter table sale_items enable row level security;
create policy "authenticated read/write sales" on sales
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write sale_items" on sale_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists idx_sales_date on sales(sale_date);
create index if not exists idx_sale_items_sale on sale_items(sale_id);
create index if not exists idx_sale_items_item on sale_items(item_id);

-- ---------------------------------------------------------
-- 4. Backfill avg_cost_rate for any items that already have
--    purchase history from before this migration
-- ---------------------------------------------------------
do $$
declare
  r record;
begin
  for r in select id from items loop
    perform recompute_stock_avg_cost(r.id);
  end loop;
end $$;

