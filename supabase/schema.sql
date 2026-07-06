-- Leather Shop — Supabase schema
-- Dashboard > SQL Editor에서 실행하세요.

-- 프로필 (소셜 로그인 시 자동 생성)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  provider text,
  created_at timestamptz not null default now()
);

-- 주문 상태
do $$ begin
  create type public.order_status as enum ('paid', 'making', 'preparing', 'delivered');
exception
  when duplicate_object then null;
end $$;

-- 주문
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  user_id uuid references auth.users (id) on delete set null,
  status public.order_status not null default 'paid',
  amount integer not null check (amount > 0),
  order_name text not null,
  shipping jsonb not null,
  items jsonb not null,
  payment_key text not null,
  payment_method text,
  approved_at timestamptz not null,
  claim_token text,
  claim_expires_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_order_id_idx on public.orders (order_id);
create index if not exists orders_claim_token_idx on public.orders (claim_token)
  where claim_token is not null;

-- 상태 변경 이력
create table if not exists public.order_status_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_at timestamptz not null default now()
);

create index if not exists order_status_log_order_id_idx on public.order_status_log (order_id);

-- 신규 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, provider)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'user_name',
      ''
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture',
      ''
    ),
    coalesce(new.raw_app_meta_data ->> 'provider', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_log enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users read own order logs" on public.order_status_log;
create policy "Users read own order logs"
  on public.order_status_log for select
  using (
    exists (
      select 1
      from public.orders
      where orders.id = order_status_log.order_id
        and orders.user_id = auth.uid()
    )
  );
