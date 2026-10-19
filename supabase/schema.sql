-- Gacha entre potes : base de données
-- À coller tel quel dans Supabase → SQL Editor → New query → Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null check (char_length(pseudo) between 2 and 20),
  legend text not null,
  gold bigint not null default 500 check (gold >= 0),
  tickets integer not null default 10 check (tickets >= 0),
  max_floor integer not null default 0,
  pity integer not null default 0,
  pulls integer not null default 0,
  team text[] not null default '{}',
  defense text[] not null default '{}',
  last_collect timestamptz not null default now(),
  next_fight_at timestamptz not null default now(),
  pvp_rating integer not null default 1000,
  pvp_wins integer not null default 0,
  pvp_losses integer not null default 0,
  pvp_day text,
  pvp_used integer not null default 0,
  collection_score integer not null default 0,
  collection_count integer not null default 0,
  version integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_pseudo_unique on public.profiles (lower(pseudo));

create table if not exists public.cards (
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null,
  lvl integer not null default 1 check (lvl >= 1),
  stars integer not null default 0 check (stars between 0 and 5),
  primary key (user_id, card_id)
);

create table if not exists public.pvp_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  attacker uuid not null references public.profiles(id) on delete cascade,
  defender uuid not null references public.profiles(id) on delete cascade,
  win boolean not null,
  delta integer not null,
  seed bigint not null
);

-- Sécurité : tout le monde (connecté) peut lire, personne ne peut écrire depuis le navigateur.
-- Seul le serveur de jeu (Edge Function « game ») modifie les données.
alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.pvp_log enable row level security;

drop policy if exists "lecture joueurs" on public.profiles;
create policy "lecture joueurs" on public.profiles for select to authenticated using (true);
drop policy if exists "lecture cartes" on public.cards;
create policy "lecture cartes" on public.cards for select to authenticated using (true);
drop policy if exists "lecture pvp" on public.pvp_log;
create policy "lecture pvp" on public.pvp_log for select to authenticated using (true);

revoke insert, update, delete on public.profiles, public.cards, public.pvp_log from anon, authenticated;

-- Mise à jour : colonne admin (sans effet si elle existe déjà)
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Mise à jour : équipes enregistrées, équipement, lieux, donjons et farm hors-ligne
alter table public.profiles add column if not exists teams jsonb not null default '[]';
alter table public.profiles add column if not exists team_idx integer not null default 0;
alter table public.profiles add column if not exists defense_place text;
alter table public.profiles add column if not exists items jsonb not null default '[]';
alter table public.profiles add column if not exists item_seq integer not null default 0;
alter table public.profiles add column if not exists places jsonb not null default '{}';
alter table public.profiles add column if not exists dungeons jsonb not null default '{"gold":0,"equip":0}';
alter table public.profiles add column if not exists farm jsonb;
