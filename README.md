# Lanna Snap · ล้านนาสแนป

A Snap-style card battle game about the 9 upper-northern provinces of Thailand (เชียงใหม่ เชียงราย ลำปาง ลำพูน แม่ฮ่องสอน น่าน แพร่ พะเยา อุตรดิตถ์).

Play: https://mozila023.github.io/lanna-snap/

## What's in phase 1
- 69 playable cards: provincial heroes, legends, two-province rainbow legends (pack-only), animals, provincial items, temples, northern food
- 14 battlefields based on real places, each with a Google Maps link
- Temple slot: a temple gives +2 to every card of its province, on both sides
- 6-turn matches against AI, snap / retreat, cowrie (เบี้ย) stakes
- Collection, deck builder, 7 cosmetic upgrade tiers
- Shop: daily cards, random packs (common 86% · legend 12% · two-province 2%), booster bags, daily gift
- Google login + cloud save through Supabase (guest play saves locally)

## Files
- `index.html`, `style.css`: the page
- `src/cards.js`: cards, battlefields, starter decks
- `src/engine.js`: deterministic game engine and AI
- `src/fx.js`: particle effects
- `src/app.js`: screens, shop, auth, saving
- `art/`: card and battlefield art (webp)
- `supabase/schema.sql`: profiles table + row-level security
- `test/sim.js`: AI-vs-AI balance simulation (`cd test && node sim.js`)

## Supabase setup (once)
1. SQL Editor → run `supabase/schema.sql`
2. Authentication → Providers → Google: paste the Google OAuth Client ID and Secret
3. Authentication → URL Configuration: Site URL `https://mozila023.github.io/lanna-snap/`, and add the same URL to Redirect URLs

Only the publishable (anon) key is in the code. Never commit the secret / service_role key.
