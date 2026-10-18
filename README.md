# Gacha entre potes

Jeu gacha / idle privé entre potes : collection de héros, combats automatiques, arène PvP et classements.

- `index.html` : le jeu (servi par GitHub Pages).
- `supabase/schema.sql` : la base de données, à exécuter une fois dans Supabase → SQL Editor.
- `supabase/functions/game/index.ts` : le serveur de jeu, à déployer comme Edge Function nommée `game`.

Toutes les règles (tirages, combats, récompenses, PvP) sont calculées par le serveur ; le navigateur ne fait que les afficher.
