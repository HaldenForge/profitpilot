-- ProfitPilot Product Research and Keyword Research
-- All research records belong to the authenticated user.

create table if not exists public.product_research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  marketplace text not null,
  product_name text not null,
  product_url text,
  image_url text,
  seller_name text,

  currency text not null default 'GBP',
  selling_price numeric(12,2),
  product_cost numeric(12,2),
  shipping_cost numeric(12,2),
  marketplace_fee_percent numeric(7,3),

  estimated_profit numeric(12,2),
  estimated_profit_margin numeric(7,2),

  estimated_monthly_searches integer,
  estimated_monthly_sales integer,
  ranking_position integer,

  demand_score numeric(5,2),
  competition_score numeric(5,2),
  opportunity_score numeric(5,2),

  data_source text,
  data_status text not null default 'unavailable'
    check (data_status in (
      'verified',
      'estimated',
      'user_entered',
      'unavailable'
    )),

  research_status text not null default 'saved'
    check (research_status in (
      'saved',
      'watching',
      'shortlisted',
      'rejected'
    )),

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.keyword_research (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  product_research_id uuid
    references public.product_research(id) on delete set null,

  marketplace text not null,
  keyword text not null,

  search_volume integer,
  competition_level text,
  competition_score numeric(5,2),
  cost_per_click numeric(12,4),
  trend_direction text,
  ranking_position integer,

  data_source text,
  data_status text not null default 'unavailable'
    check (data_status in (
      'verified',
      'estimated',
      'user_entered',
      'unavailable'
    )),

  notes text,
  created_at timestamptz not null default now()
);

-- Indexes for faster customer-specific research searches.

create index if not exists product_research_user_created_idx
  on public.product_research (user_id, created_at desc);

create index if not exists product_research_marketplace_idx
  on public.product_research (user_id, marketplace);

create index if not exists keyword_research_user_created_idx
  on public.keyword_research (user_id, created_at desc);

create index if not exists keyword_research_marketplace_idx
  on public.keyword_research (user_id, marketplace);

create index if not exists keyword_research_keyword_idx
  on public.keyword_research (user_id, keyword);

-- Enable Row Level Security.

alter table public.product_research enable row level security;
alter table public.keyword_research enable row level security;

-- Customers can only access their own product research.

create policy "Users can view their own product research"
  on public.product_research
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own product research"
  on public.product_research
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own product research"
  on public.product_research
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own product research"
  on public.product_research
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Customers can only access their own keyword research.

create policy "Users can view their own keyword research"
  on public.keyword_research
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own keyword research"
  on public.keyword_research
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own keyword research"
  on public.keyword_research
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own keyword research"
  on public.keyword_research
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
