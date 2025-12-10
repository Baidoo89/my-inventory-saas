-- 1. Create a Profiles table to store "Store Name" and settings permanently
-- This ensures that if a user logs in on a DIFFERENT machine, they still see their Store Name.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  store_name text null,
  currency_symbol text null default 'GH₵',
  address text null,
  phone text null,
  tax_rate numeric default 0,
  low_stock_threshold integer default 5,
  primary key (id)
);

-- 2. Enable Security (RLS) on all tables
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.profiles enable row level security;

-- 3. Create "Policies" (The Rules of Isolation)

-- PRODUCTS: Users can only see/edit their OWN products
create policy "Users can view own products" 
on public.products for select 
using (auth.uid() = user_id);

create policy "Users can insert own products" 
on public.products for insert 
with check (auth.uid() = user_id);

create policy "Users can update own products" 
on public.products for update 
using (auth.uid() = user_id);

create policy "Users can delete own products" 
on public.products for delete 
using (auth.uid() = user_id);

-- SALES: Users can only see/edit their OWN sales
create policy "Users can view own sales" 
on public.sales for select 
using (auth.uid() = user_id);

create policy "Users can insert own sales" 
on public.sales for insert 
with check (auth.uid() = user_id);

-- PROFILES: Users can only see/edit their OWN profile
create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update 
using (auth.uid() = id);

create policy "Users can insert own profile" 
on public.profiles for insert 
with check (auth.uid() = id);

-- 4. Auto-create a profile when a new user signs up
-- This is a "Trigger". It runs automatically when a user signs up.
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, store_name)
  values (new.id, 'My Store');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
