-- Gacha entre potes : mise à jour pour le compte admin.
-- 1) Colle ce bloc dans Supabase → SQL Editor → Run (une seule fois).
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2) Après avoir créé le compte admin dans le jeu, remplace Admin par son pseudo exact puis exécute cette ligne :
update public.profiles set is_admin = true where lower(pseudo) = lower('Admin');
