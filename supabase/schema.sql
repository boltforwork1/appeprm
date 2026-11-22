-- ============================================================================
--  Allam ERP — complete database schema
--  Paste this whole file into the Supabase SQL Editor and run it.
--
--  Conventions applied to every table:
--    - id          uuid primary key default gen_random_uuid()
--    - created_at  timestamptz default now()
--    - updated_at  timestamptz default now(), auto-updated by trigger
--    - is_deleted  boolean default false   (soft delete)
--    - index on updated_at
--    - RLS enabled
--    - policies: only authenticated users may SELECT / INSERT / UPDATE / DELETE
-- ============================================================================

-- ---------- shared updated_at trigger function -------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- helper: create the standard trigger + indexes + RLS + policies for a table
-- (kept inline below for transparency; you can read every statement.)

-- ============================================================================
-- 1. MATERIALS
-- ============================================================================

create table if not exists public.materials (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  unit             text not null,
  avg_market_price numeric(14,2),
  category         text default 'general',
  is_deleted       boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists materials_updated_at_idx on public.materials (updated_at);
alter table public.materials enable row level security;
drop policy if exists "materials_select" on public.materials;
drop policy if exists "materials_insert" on public.materials;
drop policy if exists "materials_update" on public.materials;
drop policy if exists "materials_delete" on public.materials;
create policy "materials_select" on public.materials for select to authenticated using (true);
create policy "materials_insert" on public.materials for insert to authenticated with check (true);
create policy "materials_update" on public.materials for update to authenticated using (true) with check (true);
create policy "materials_delete" on public.materials for delete to authenticated using (true);
drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at before update on public.materials
  for each row execute function public.set_updated_at();

create table if not exists public.price_quotes (
  id          uuid primary key default gen_random_uuid(),
  material_id uuid references public.materials(id) on delete set null,
  supplier    text,
  price       numeric(14,2),
  date        date,
  notes       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists price_quotes_updated_at_idx on public.price_quotes (updated_at);
create index if not exists price_quotes_material_id_idx on public.price_quotes (material_id);
alter table public.price_quotes enable row level security;
drop policy if exists "price_quotes_select" on public.price_quotes;
drop policy if exists "price_quotes_insert" on public.price_quotes;
drop policy if exists "price_quotes_update" on public.price_quotes;
drop policy if exists "price_quotes_delete" on public.price_quotes;
create policy "price_quotes_select" on public.price_quotes for select to authenticated using (true);
create policy "price_quotes_insert" on public.price_quotes for insert to authenticated with check (true);
create policy "price_quotes_update" on public.price_quotes for update to authenticated using (true) with check (true);
create policy "price_quotes_delete" on public.price_quotes for delete to authenticated using (true);
drop trigger if exists price_quotes_set_updated_at on public.price_quotes;
create trigger price_quotes_set_updated_at before update on public.price_quotes
  for each row execute function public.set_updated_at();

create table if not exists public.price_lists (
  id          uuid primary key default gen_random_uuid(),
  list_name   text not null,
  material_id uuid references public.materials(id) on delete set null,
  price       numeric(14,2),
  unit        text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists price_lists_updated_at_idx on public.price_lists (updated_at);
create index if not exists price_lists_list_name_idx on public.price_lists (list_name);
alter table public.price_lists enable row level security;
drop policy if exists "price_lists_select" on public.price_lists;
drop policy if exists "price_lists_insert" on public.price_lists;
drop policy if exists "price_lists_update" on public.price_lists;
drop policy if exists "price_lists_delete" on public.price_lists;
create policy "price_lists_select" on public.price_lists for select to authenticated using (true);
create policy "price_lists_insert" on public.price_lists for insert to authenticated with check (true);
create policy "price_lists_update" on public.price_lists for update to authenticated using (true) with check (true);
create policy "price_lists_delete" on public.price_lists for delete to authenticated using (true);
drop trigger if exists price_lists_set_updated_at on public.price_lists;
create trigger price_lists_set_updated_at before update on public.price_lists
  for each row execute function public.set_updated_at();

create table if not exists public.material_quantities (
  id            uuid primary key default gen_random_uuid(),
  material_id   uuid references public.materials(id) on delete set null,
  building_type text,
  qty           numeric(14,2),
  is_deleted    boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists material_quantities_updated_at_idx on public.material_quantities (updated_at);
create index if not exists material_quantities_material_id_idx on public.material_quantities (material_id);
alter table public.material_quantities enable row level security;
drop policy if exists "material_quantities_select" on public.material_quantities;
drop policy if exists "material_quantities_insert" on public.material_quantities;
drop policy if exists "material_quantities_update" on public.material_quantities;
drop policy if exists "material_quantities_delete" on public.material_quantities;
create policy "material_quantities_select" on public.material_quantities for select to authenticated using (true);
create policy "material_quantities_insert" on public.material_quantities for insert to authenticated with check (true);
create policy "material_quantities_update" on public.material_quantities for update to authenticated using (true) with check (true);
create policy "material_quantities_delete" on public.material_quantities for delete to authenticated using (true);
drop trigger if exists material_quantities_set_updated_at on public.material_quantities;
create trigger material_quantities_set_updated_at before update on public.material_quantities
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. PROJECTS & SITES
-- ============================================================================

-- clients is defined here (instead of in section 6) because projects references it.
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  company     text,
  notes       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists clients_updated_at_idx on public.clients (updated_at);
alter table public.clients enable row level security;
drop policy if exists "clients_select" on public.clients;
drop policy if exists "clients_insert" on public.clients;
drop policy if exists "clients_update" on public.clients;
drop policy if exists "clients_delete" on public.clients;
create policy "clients_select" on public.clients for select to authenticated using (true);
create policy "clients_insert" on public.clients for insert to authenticated with check (true);
create policy "clients_update" on public.clients for update to authenticated using (true) with check (true);
create policy "clients_delete" on public.clients for delete to authenticated using (true);
drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  client_id        uuid references public.clients(id) on delete set null,
  progress_percent numeric(5,2) default 0,
  engineer         text,
  foreman          text,
  status           text default 'planning',
  is_deleted       boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists projects_updated_at_idx on public.projects (updated_at);
create index if not exists projects_client_id_idx on public.projects (client_id);
alter table public.projects enable row level security;
drop policy if exists "projects_select" on public.projects;
drop policy if exists "projects_insert" on public.projects;
drop policy if exists "projects_update" on public.projects;
drop policy if exists "projects_delete" on public.projects;
create policy "projects_select" on public.projects for select to authenticated using (true);
create policy "projects_insert" on public.projects for insert to authenticated with check (true);
create policy "projects_update" on public.projects for update to authenticated using (true) with check (true);
create policy "projects_delete" on public.projects for delete to authenticated using (true);
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table if not exists public.daily_notes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete set null,
  text        text,
  photo_url   text,
  date        date,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists daily_notes_updated_at_idx on public.daily_notes (updated_at);
create index if not exists daily_notes_project_id_idx on public.daily_notes (project_id);
alter table public.daily_notes enable row level security;
drop policy if exists "daily_notes_select" on public.daily_notes;
drop policy if exists "daily_notes_insert" on public.daily_notes;
drop policy if exists "daily_notes_update" on public.daily_notes;
drop policy if exists "daily_notes_delete" on public.daily_notes;
create policy "daily_notes_select" on public.daily_notes for select to authenticated using (true);
create policy "daily_notes_insert" on public.daily_notes for insert to authenticated with check (true);
create policy "daily_notes_update" on public.daily_notes for update to authenticated using (true) with check (true);
create policy "daily_notes_delete" on public.daily_notes for delete to authenticated using (true);
drop trigger if exists daily_notes_set_updated_at on public.daily_notes;
create trigger daily_notes_set_updated_at before update on public.daily_notes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. WAREHOUSES & REQUESTS
-- ============================================================================

create table if not exists public.warehouses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  location    text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists warehouses_updated_at_idx on public.warehouses (updated_at);
alter table public.warehouses enable row level security;
drop policy if exists "warehouses_select" on public.warehouses;
drop policy if exists "warehouses_insert" on public.warehouses;
drop policy if exists "warehouses_update" on public.warehouses;
drop policy if exists "warehouses_delete" on public.warehouses;
create policy "warehouses_select" on public.warehouses for select to authenticated using (true);
create policy "warehouses_insert" on public.warehouses for insert to authenticated with check (true);
create policy "warehouses_update" on public.warehouses for update to authenticated using (true) with check (true);
create policy "warehouses_delete" on public.warehouses for delete to authenticated using (true);
drop trigger if exists warehouses_set_updated_at on public.warehouses;
create trigger warehouses_set_updated_at before update on public.warehouses
  for each row execute function public.set_updated_at();

create table if not exists public.stock (
  id            uuid primary key default gen_random_uuid(),
  warehouse_id  uuid references public.warehouses(id) on delete set null,
  material_id   uuid references public.materials(id) on delete set null,
  qty           numeric(14,2) default 0,
  is_deleted    boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists stock_updated_at_idx on public.stock (updated_at);
create index if not exists stock_warehouse_id_idx on public.stock (warehouse_id);
create index if not exists stock_material_id_idx on public.stock (material_id);
alter table public.stock enable row level security;
drop policy if exists "stock_select" on public.stock;
drop policy if exists "stock_insert" on public.stock;
drop policy if exists "stock_update" on public.stock;
drop policy if exists "stock_delete" on public.stock;
create policy "stock_select" on public.stock for select to authenticated using (true);
create policy "stock_insert" on public.stock for insert to authenticated with check (true);
create policy "stock_update" on public.stock for update to authenticated using (true) with check (true);
create policy "stock_delete" on public.stock for delete to authenticated using (true);
drop trigger if exists stock_set_updated_at on public.stock;
create trigger stock_set_updated_at before update on public.stock
  for each row execute function public.set_updated_at();

create table if not exists public.material_requests (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete set null,
  material_id uuid references public.materials(id) on delete set null,
  qty         numeric(14,2) default 0,
  status      text default 'requested',
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists material_requests_updated_at_idx on public.material_requests (updated_at);
create index if not exists material_requests_project_id_idx on public.material_requests (project_id);
alter table public.material_requests enable row level security;
drop policy if exists "material_requests_select" on public.material_requests;
drop policy if exists "material_requests_insert" on public.material_requests;
drop policy if exists "material_requests_update" on public.material_requests;
drop policy if exists "material_requests_delete" on public.material_requests;
create policy "material_requests_select" on public.material_requests for select to authenticated using (true);
create policy "material_requests_insert" on public.material_requests for insert to authenticated with check (true);
create policy "material_requests_update" on public.material_requests for update to authenticated using (true) with check (true);
create policy "material_requests_delete" on public.material_requests for delete to authenticated using (true);
drop trigger if exists material_requests_set_updated_at on public.material_requests;
create trigger material_requests_set_updated_at before update on public.material_requests
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. ACCOUNTS & FINANCE
-- ============================================================================

create table if not exists public.suppliers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  notes       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists suppliers_updated_at_idx on public.suppliers (updated_at);
alter table public.suppliers enable row level security;
drop policy if exists "suppliers_select" on public.suppliers;
drop policy if exists "suppliers_insert" on public.suppliers;
drop policy if exists "suppliers_update" on public.suppliers;
drop policy if exists "suppliers_delete" on public.suppliers;
create policy "suppliers_select" on public.suppliers for select to authenticated using (true);
create policy "suppliers_insert" on public.suppliers for insert to authenticated with check (true);
create policy "suppliers_update" on public.suppliers for update to authenticated using (true) with check (true);
create policy "suppliers_delete" on public.suppliers for delete to authenticated using (true);
drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at before update on public.suppliers
  for each row execute function public.set_updated_at();

create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete set null,
  amount      numeric(14,2) default 0,
  category    text,
  date        date,
  notes       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists expenses_updated_at_idx on public.expenses (updated_at);
create index if not exists expenses_project_id_idx on public.expenses (project_id);
alter table public.expenses enable row level security;
drop policy if exists "expenses_select" on public.expenses;
drop policy if exists "expenses_insert" on public.expenses;
drop policy if exists "expenses_update" on public.expenses;
drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_select" on public.expenses for select to authenticated using (true);
create policy "expenses_insert" on public.expenses for insert to authenticated with check (true);
create policy "expenses_update" on public.expenses for update to authenticated using (true) with check (true);
create policy "expenses_delete" on public.expenses for delete to authenticated using (true);
drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at before update on public.expenses
  for each row execute function public.set_updated_at();

create table if not exists public.revenues (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.projects(id) on delete set null,
  amount      numeric(14,2) default 0,
  source      text,
  date        date,
  notes       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists revenues_updated_at_idx on public.revenues (updated_at);
create index if not exists revenues_project_id_idx on public.revenues (project_id);
alter table public.revenues enable row level security;
drop policy if exists "revenues_select" on public.revenues;
drop policy if exists "revenues_insert" on public.revenues;
drop policy if exists "revenues_update" on public.revenues;
drop policy if exists "revenues_delete" on public.revenues;
create policy "revenues_select" on public.revenues for select to authenticated using (true);
create policy "revenues_insert" on public.revenues for insert to authenticated with check (true);
create policy "revenues_update" on public.revenues for update to authenticated using (true) with check (true);
create policy "revenues_delete" on public.revenues for delete to authenticated using (true);
drop trigger if exists revenues_set_updated_at on public.revenues;
create trigger revenues_set_updated_at before update on public.revenues
  for each row execute function public.set_updated_at();

create table if not exists public.invoices (
  id          uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  project_id  uuid references public.projects(id) on delete set null,
  amount      numeric(14,2) default 0,
  status      text default 'unpaid',
  date        date,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists invoices_updated_at_idx on public.invoices (updated_at);
create index if not exists invoices_supplier_id_idx on public.invoices (supplier_id);
alter table public.invoices enable row level security;
drop policy if exists "invoices_select" on public.invoices;
drop policy if exists "invoices_insert" on public.invoices;
drop policy if exists "invoices_update" on public.invoices;
drop policy if exists "invoices_delete" on public.invoices;
create policy "invoices_select" on public.invoices for select to authenticated using (true);
create policy "invoices_insert" on public.invoices for insert to authenticated with check (true);
create policy "invoices_update" on public.invoices for update to authenticated using (true) with check (true);
create policy "invoices_delete" on public.invoices for delete to authenticated using (true);
drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. EMPLOYEES & ATTENDANCE
-- ============================================================================

create table if not exists public.employees (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  job_title   text,
  daily_wage  numeric(14,2) default 0,
  phone       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists employees_updated_at_idx on public.employees (updated_at);
alter table public.employees enable row level security;
drop policy if exists "employees_select" on public.employees;
drop policy if exists "employees_insert" on public.employees;
drop policy if exists "employees_update" on public.employees;
drop policy if exists "employees_delete" on public.employees;
create policy "employees_select" on public.employees for select to authenticated using (true);
create policy "employees_insert" on public.employees for insert to authenticated with check (true);
create policy "employees_update" on public.employees for update to authenticated using (true) with check (true);
create policy "employees_delete" on public.employees for delete to authenticated using (true);
drop trigger if exists employees_set_updated_at on public.employees;
create trigger employees_set_updated_at before update on public.employees
  for each row execute function public.set_updated_at();

create table if not exists public.attendance (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  date        date,
  status      text default 'present',
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists attendance_updated_at_idx on public.attendance (updated_at);
create index if not exists attendance_employee_id_idx on public.attendance (employee_id);
alter table public.attendance enable row level security;
drop policy if exists "attendance_select" on public.attendance;
drop policy if exists "attendance_insert" on public.attendance;
drop policy if exists "attendance_update" on public.attendance;
drop policy if exists "attendance_delete" on public.attendance;
create policy "attendance_select" on public.attendance for select to authenticated using (true);
create policy "attendance_insert" on public.attendance for insert to authenticated with check (true);
create policy "attendance_update" on public.attendance for update to authenticated using (true) with check (true);
create policy "attendance_delete" on public.attendance for delete to authenticated using (true);
drop trigger if exists attendance_set_updated_at on public.attendance;
create trigger attendance_set_updated_at before update on public.attendance
  for each row execute function public.set_updated_at();

create table if not exists public.salaries (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  month       text,
  amount      numeric(14,2) default 0,
  paid        boolean default false,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists salaries_updated_at_idx on public.salaries (updated_at);
create index if not exists salaries_employee_id_idx on public.salaries (employee_id);
alter table public.salaries enable row level security;
drop policy if exists "salaries_select" on public.salaries;
drop policy if exists "salaries_insert" on public.salaries;
drop policy if exists "salaries_update" on public.salaries;
drop policy if exists "salaries_delete" on public.salaries;
create policy "salaries_select" on public.salaries for select to authenticated using (true);
create policy "salaries_insert" on public.salaries for insert to authenticated with check (true);
create policy "salaries_update" on public.salaries for update to authenticated using (true) with check (true);
create policy "salaries_delete" on public.salaries for delete to authenticated using (true);
drop trigger if exists salaries_set_updated_at on public.salaries;
create trigger salaries_set_updated_at before update on public.salaries
  for each row execute function public.set_updated_at();

create table if not exists public.leaves (
  id          uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  start_date  date,
  end_date    date,
  reason      text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists leaves_updated_at_idx on public.leaves (updated_at);
create index if not exists leaves_employee_id_idx on public.leaves (employee_id);
alter table public.leaves enable row level security;
drop policy if exists "leaves_select" on public.leaves;
drop policy if exists "leaves_insert" on public.leaves;
drop policy if exists "leaves_update" on public.leaves;
drop policy if exists "leaves_delete" on public.leaves;
create policy "leaves_select" on public.leaves for select to authenticated using (true);
create policy "leaves_insert" on public.leaves for insert to authenticated with check (true);
create policy "leaves_update" on public.leaves for update to authenticated using (true) with check (true);
create policy "leaves_delete" on public.leaves for delete to authenticated using (true);
drop trigger if exists leaves_set_updated_at on public.leaves;
create trigger leaves_set_updated_at before update on public.leaves
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 6. CLIENTS & CONTRACTORS  (the clients table is defined in section 2 above
--    because projects references it; the remaining client-related tables follow.)
-- ============================================================================

create table if not exists public.quotes (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete set null,
  amount      numeric(14,2) default 0,
  date        date,
  status      text default 'draft',
  notes       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists quotes_updated_at_idx on public.quotes (updated_at);
create index if not exists quotes_client_id_idx on public.quotes (client_id);
alter table public.quotes enable row level security;
drop policy if exists "quotes_select" on public.quotes;
drop policy if exists "quotes_insert" on public.quotes;
drop policy if exists "quotes_update" on public.quotes;
drop policy if exists "quotes_delete" on public.quotes;
create policy "quotes_select" on public.quotes for select to authenticated using (true);
create policy "quotes_insert" on public.quotes for insert to authenticated with check (true);
create policy "quotes_update" on public.quotes for update to authenticated using (true) with check (true);
create policy "quotes_delete" on public.quotes for delete to authenticated using (true);
drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at before update on public.quotes
  for each row execute function public.set_updated_at();

create table if not exists public.contracts (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete set null,
  project_id  uuid references public.projects(id) on delete set null,
  value       numeric(14,2) default 0,
  status      text default 'draft',
  start_date  date,
  notes       text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists contracts_updated_at_idx on public.contracts (updated_at);
create index if not exists contracts_client_id_idx on public.contracts (client_id);
alter table public.contracts enable row level security;
drop policy if exists "contracts_select" on public.contracts;
drop policy if exists "contracts_insert" on public.contracts;
drop policy if exists "contracts_update" on public.contracts;
drop policy if exists "contracts_delete" on public.contracts;
create policy "contracts_select" on public.contracts for select to authenticated using (true);
create policy "contracts_insert" on public.contracts for insert to authenticated with check (true);
create policy "contracts_update" on public.contracts for update to authenticated using (true) with check (true);
create policy "contracts_delete" on public.contracts for delete to authenticated using (true);
drop trigger if exists contracts_set_updated_at on public.contracts;
create trigger contracts_set_updated_at before update on public.contracts
  for each row execute function public.set_updated_at();

create table if not exists public.follow_ups (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete set null,
  date        date,
  text        text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists follow_ups_updated_at_idx on public.follow_ups (updated_at);
create index if not exists follow_ups_client_id_idx on public.follow_ups (client_id);
alter table public.follow_ups enable row level security;
drop policy if exists "follow_ups_select" on public.follow_ups;
drop policy if exists "follow_ups_insert" on public.follow_ups;
drop policy if exists "follow_ups_update" on public.follow_ups;
drop policy if exists "follow_ups_delete" on public.follow_ups;
create policy "follow_ups_select" on public.follow_ups for select to authenticated using (true);
create policy "follow_ups_insert" on public.follow_ups for insert to authenticated with check (true);
create policy "follow_ups_update" on public.follow_ups for update to authenticated using (true) with check (true);
create policy "follow_ups_delete" on public.follow_ups for delete to authenticated using (true);
drop trigger if exists follow_ups_set_updated_at on public.follow_ups;
create trigger follow_ups_set_updated_at before update on public.follow_ups
  for each row execute function public.set_updated_at();

create table if not exists public.correspondence (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references public.clients(id) on delete set null,
  subject     text,
  date        date,
  body        text,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists correspondence_updated_at_idx on public.correspondence (updated_at);
create index if not exists correspondence_client_id_idx on public.correspondence (client_id);
alter table public.correspondence enable row level security;
drop policy if exists "correspondence_select" on public.correspondence;
drop policy if exists "correspondence_insert" on public.correspondence;
drop policy if exists "correspondence_update" on public.correspondence;
drop policy if exists "correspondence_delete" on public.correspondence;
create policy "correspondence_select" on public.correspondence for select to authenticated using (true);
create policy "correspondence_insert" on public.correspondence for insert to authenticated with check (true);
create policy "correspondence_update" on public.correspondence for update to authenticated using (true) with check (true);
create policy "correspondence_delete" on public.correspondence for delete to authenticated using (true);
drop trigger if exists correspondence_set_updated_at on public.correspondence;
create trigger correspondence_set_updated_at before update on public.correspondence
  for each row execute function public.set_updated_at();

-- ============================================================================
--  Done. 21 tables, all with updated_at triggers, soft-delete, indexes, and RLS.
-- ============================================================================
