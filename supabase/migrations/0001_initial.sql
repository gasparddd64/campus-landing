-- ============================================================
-- 0001_initial.sql — Campus Landing MVP — Semaine 1
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

create table campuses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  city          text not null,
  state         text not null,
  slug          text not null unique,
  email_domains text[] not null default '{}'
);

create table cohorts (
  id            uuid primary key default gen_random_uuid(),
  campus_id     uuid not null references campuses(id) on delete cascade,
  intake_month  int  not null check (intake_month between 1 and 12),
  intake_year   int  not null check (intake_year between 2024 and 2030),
  unique (campus_id, intake_month, intake_year)
);

create table profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  campus_id              uuid references campuses(id) on delete set null,
  display_name           text not null,
  avatar_url             text,
  program                text,
  bio                    text,
  languages              text[] not null default '{}',
  origin_country         text,                      -- nullable, never required
  origin_country_visible boolean not null default false,
  created_at             timestamptz not null default now()
);

create table cohort_members (
  profile_id  uuid not null references profiles(id) on delete cascade,
  cohort_id   uuid not null references cohorts(id)  on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (profile_id, cohort_id)
);

create table waitlist (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────

create index cohorts_campus_idx     on cohorts(campus_id);
create index cohort_members_cohort  on cohort_members(cohort_id);
create index cohort_members_profile on cohort_members(profile_id);
create index profiles_campus_idx    on profiles(campus_id);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table campuses       enable row level security;
alter table cohorts        enable row level security;
alter table profiles       enable row level security;
alter table cohort_members enable row level security;
alter table waitlist       enable row level security;

-- campuses: readable by all authenticated users (needed for onboarding select)
create policy "campuses: authenticated read"
  on campuses for select
  to authenticated
  using (true);

-- cohorts: readable by members of that campus
create policy "cohorts: campus members read"
  on cohorts for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.campus_id = cohorts.campus_id
    )
  );

-- cohorts: insert allowed for authenticated (needed during onboarding)
create policy "cohorts: authenticated insert"
  on cohorts for insert
  to authenticated
  with check (true);

-- profiles: readable by members of the same campus
-- origin_country filtered via view (see below) — raw table readable without it
create policy "profiles: same campus read"
  on profiles for select
  to authenticated
  using (
    campus_id = (
      select campus_id from profiles p2
      where p2.id = auth.uid()
      limit 1
    )
  );

-- profiles: insert / update own row only
create policy "profiles: own insert"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: own update"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- cohort_members: readable by members of the same cohort
create policy "cohort_members: same cohort read"
  on cohort_members for select
  to authenticated
  using (
    exists (
      select 1 from cohort_members cm2
      where cm2.cohort_id  = cohort_members.cohort_id
        and cm2.profile_id = auth.uid()
    )
  );

-- cohort_members: insert own row only
create policy "cohort_members: own insert"
  on cohort_members for insert
  to authenticated
  with check (profile_id = auth.uid());

-- waitlist: insert only, no read for regular users
create policy "waitlist: insert"
  on waitlist for insert
  to authenticated, anon
  with check (true);

-- ────────────────────────────────────────────────────────────
-- VIEW: profiles_public (hides origin_country when invisible)
-- ────────────────────────────────────────────────────────────

create or replace view profiles_public as
select
  id,
  campus_id,
  display_name,
  avatar_url,
  program,
  bio,
  languages,
  case when origin_country_visible then origin_country else null end as origin_country,
  origin_country_visible,
  created_at
from profiles;

-- ────────────────────────────────────────────────────────────
-- SEED DATA — campuses (10 for launch)
-- ────────────────────────────────────────────────────────────

insert into campuses (name, city, state, slug, email_domains) values
  ('MIT',               'Cambridge',     'MA', 'mit',        '{"mit.edu"}'),
  ('Stanford University','Stanford',     'CA', 'stanford',   '{"stanford.edu"}'),
  ('Columbia University','New York',     'NY', 'columbia',   '{"columbia.edu"}'),
  ('NYU',               'New York',      'NY', 'nyu',        '{"nyu.edu"}'),
  ('UCLA',              'Los Angeles',   'CA', 'ucla',       '{"ucla.edu"}'),
  ('USC',               'Los Angeles',   'CA', 'usc',        '{"usc.edu"}'),
  ('Carnegie Mellon',   'Pittsburgh',    'PA', 'cmu',        '{"cmu.edu","andrew.cmu.edu"}'),
  ('Georgia Tech',      'Atlanta',       'GA', 'gatech',     '{"gatech.edu"}'),
  ('University of Michigan','Ann Arbor', 'MI', 'umich',      '{"umich.edu"}'),
  ('Northeastern University','Boston',   'MA', 'northeastern','{"northeastern.edu"}');
