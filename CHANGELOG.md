# Changelog

A chronological record of the work done to turn the recovered
**requiem.isnet.ru** dump into a working static archive. Entries are grouped
by date/session rather than by version, since this is an ongoing restoration
project rather than a versioned product.

## 2026-06-09 — Initial archive setup

- Initial commit: static archive of the requiem.isnet.ru knowledge base,
  recovered from the Wayback Machine.
- Fixed broken images caused by inline `style="background: url(/template/...)"`
  references with a leading slash.
- First pass at fixing the Calculator's skill data so it matches the current
  game version.

## 2026-06-10 — Core fixes, missing pages, GitHub Pages prep

- **buns.js crash**: hardcoded the UI label strings instead of relying on a
  POST to `/ajax/character/load`, which fixed a crash that affected every page.
- **About page**: replaced the unresolved `%username%` template artifact with
  static text.
- **Quests**: rebuilt listing with client-side pagination, search and filters
  backed by a generated `template/js/quests_data.json`; fixed the invalid
  `<a>`-wrapped submit button.
- **Quest rewards**: implemented `Quest_box.reward_load()` plus a generated
  `quest_rewards_data.js` (786 quests), with ~520 item icons added.
- **Monsters**: created the missing `monsters.js`, restoring zone/monster
  hover behavior.
- **Removed** `/experience/` and `/fitting/` — not enough data to restore them.
- Regenerated `skills_data.js` (in addition to `.json`) so the Calculator
  works under `file://` as well.
- **Calculator dependency arrows**: built `build_calculator_arrows.py`, which
  geometrically matches each skill/prerequisite pair to its arrow element and
  fills in `requirement[1]/[2]` (262 → 279 arrows matched). Also fixed 8
  skills with orphaned arrows pointing at them.
- Rewrote `.gitignore`, added root `README.md`, picked the repo name
  `requiem-online-archive`.
- **GitHub Pages subpath support**: added `<base href="/requiem-online-archive/"/>`
  to all ~2,982 HTML pages, stripped leading slashes from internal
  links/asset paths (HTML + JS), and updated `serve.py` to mirror the same
  subpath locally.
- Surveyed the current game's skill trees vs. the 2022 data: found 19
  missing post-2022 skill instances (11 unique skill IDs) across 11 classes,
  compiled into `all_csv/missing_skills_2026.json` for later use.
- Identified two outstanding bugs for later: tooltip pushing the page layout
  on hover, and "Reset build" navigating to the Home page.

## 2026-06-10 / 2026-06-11 — Calculator skill trees brought up to date, race by race

Working through each playable race's classes against current in-game skill
trees, adding missing skills/arrows, fixing wrong data, and converting new
skill icons:

- **Turan** (Defender, Commander, Protector, Templar, Tempest, Radiant —
  classes 2/3/4/6/7/8): added *Hilt Strike*, *Skin of Sand* and
  *Unstoppable Force* (Defender/Commander/Protector); added *Divine Shield*
  and repositioned *Lithifying Fog* (Protector); removed the non-existent
  *Divine Protection* skill (Templar/Tempest/Radiant); added *Shield Smack*
  (Tempest) and *Greater Heal* (Radiant). Fixed several skills that had
  damage values stored where "required character level" was expected.
- **Bartuk** (Shaman, Forsaker, Mystic — classes 16/17/18): added
  *Emblazed Mind* (shared by all three), *Loa's Misfortune* (Forsaker), and
  *Fire Mandala* + *Disarming Totem* (Mystic).
- **Kruxena** (ShadowRunner, Assassin, SoulHunter, Defiler, Dominator —
  classes 33/34/36/37/38): added *Concussive Shot* (ShadowRunner) and
  *Stinging Rescission* (Assassin), repositioned *Explosive Hacking*
  (Assassin), added a missing shared arrow for *Binding Soul*
  (SoulHunter/Defiler/Dominator), fixed the Dominator breadcrumb, restored
  the missing Rogue class portrait, and introduced a new arrow type (10) for
  the repositioned Concussive Shot connector.
- **Xenoa** (Ranger — class 24): added the *Bullseye* skill. **Druid**
  (class 27): removed a misleading "Prerequisite Skill" tooltip that appeared
  on 11 skills with no real dependency.
- All new icons converted from the game's `.dds`/`.tga` assets via
  `convert_icons.py`. `build_calculator_arrows.py` re-run after each
  change (final count: 297/297 arrows matched).
- Each race's changes validated visually against a local `serve.py` instance
  using Playwright screenshots.

## 2026-06-11 — Tooltip and Reset build fixes

- **Tooltip overflow**: `ToolTip.show()`/`show_item()` now clamp the tooltip
  position to the viewport, fixing a layout shift that occurred when hovering
  skills near the edge of narrow windows.
- **Reset build going to Home**: root cause was `history.replaceState()`
  writing a relative `#hash` URL that got resolved against
  `<base href="/requiem-online-archive/"/>` instead of the current page,
  silently moving `window.location.pathname` to the site root. Fixed by
  capturing the page's path once at load time and reusing it for both the
  hash updates and the reset action.

## 2026-06-12 — Full site audit + English text cleanup (part 1)

Ran a full audit for `.gitignore` completeness, missing icons, and
non-English/corrupted text. `.gitignore` and the quest/skill icon sets were
already clean (only 11 isolated missing icons found, see follow-up). Fixed
the two highest-volume, purely mechanical text issues:

- **Mojibake cleanup**: fixed 6 corrupted-punctuation byte patterns
  (`ЎЇ`, `Ў¦`, `Ў°`, `Ў±`, `¡¯`, `¡¦`, `¡¡`) across 365 quest pages —
  873 occurrences restored to `'`, `"`/`"`, `...`.
- **Quest list titles**: 1062 quest titles that showed up in Russian on
  quest filter/search listing pages (while the quest's own page already had
  the correct English title) were replaced with that English title — 1499
  occurrences fixed across 77 listing pages.
- Remaining non-English content (44 quest pages with no English title at
  all, 74 quest pages with partial Russian body text/reward names, 10
  monster pages with Russian-only names, 2 Russian 404 pages, and a handful
  of empty-data-driven icon paths like `rider_.png`/`target_.png`) is tracked
  for a follow-up pass — these need actual translation or data fixes, not a
  mechanical find/replace.

## 2026-06-12 — Full site audit + English text cleanup (part 2)

Translated the remaining 118 Russian quest pages identified in part 1:

- **Title/Objective/Description/Reward**: for the 118 affected quest pages,
  replaced Cyrillic `<h1>` titles, "Objective", "Description" and "Reward"
  text with the official English strings from `all_csv/QuestString.csv`
  (`Sub_Title`, `Quest_Goal`, `Quest_Dialog`, `Reward_Dialog`) — 44 titles,
  116 objectives, 116 descriptions and 88 rewards fixed, plus the
  "Дополнительная сумка" → "Additional bag" label on 3 quests with an extra
  bag reward.
- **Listing pages**: re-propagated the 44 newly-fixed titles to the 18
  filter/search listing pages that still referenced them (124 entries).
- **Breadcrumbs and prev/next quest navigation**: 46 breadcrumbs and 11
  prev/next links still showed the old Russian title; replaced with the
  quest's own (now English) title.
- **NPC names, monster/item targets and reward items**: translated ~115
  remaining Russian strings — quest giver/turn-in NPC names (e.g. Шедрин →
  Shedrin, Карл Пеллус → Karl Pellus), kill/collect/delivery target names
  shown via `monsters/m{id}` links (e.g. Железный солдат → Iron Soldier,
  Ящик с припасами → Supply Crate), reward item names (Ксеон/Пояс
  кровожадности → Xeon/Belt of Bloodlust), and the "Выберите одну из
  возможных наград" reward-choice label.
- Fixed the last leftover Cyrillic on the whole site: the pre-filled search
  box value (`рекс` → `rex`) on a cached search-results page.
- A full-site grep for Cyrillic text now returns zero matches across all
  `.html` pages. Remaining Cyrillic in `template/js/*.js` is limited to
  source-code comments and a dead legacy login-placeholder check — not
  user-visible, left as-is.
- **Missing quest objective icons**: converted the 6 remaining `.dds` icons
  (`I_E_Metal_02`, `I_E_Stomach_06`, `Q_Hotdog`, `Q_Pancakes`→`Q_Pancake`,
  `Q_Taco`, `E_Tile`→`Tile`) from the game client into
  `template/images/items/*.png`, fixing broken icons on quests q58030,
  q10320, q32260, q32250, q32280 and q9970.

## 2026-06-12 — Link/accessibility fixes and calculator hash sync

- **About page**: fixed the "View on GitHub" link, which pointed to
  `https://github.com` instead of the project's repo.
- **Home logo link**: added an `aria-label` to the logo link on all
  ~2,981 pages, which previously had no accessible text (`<a href=".">`
  wrapping only a background-image div).
- **Calculator hash sync**: `load_from_hash()` now re-syncs the URL hash
  after restoring a shared build. Previously, `select_level()` (called
  during hash parsing) rewrote the hash with an all-zero build before the
  skill levels were restored, so the visible build was correct on first
  load but got lost on reload or "Copy link".

## 2026-06-12 — Design pass: calculator typography, monster listing and detail pages

- **Form typography site-wide**: `normalize.css`'s `font-family: sans-serif`
  on `button`/`input`/`select`/`textarea` was overriding the theme's Inter
  font on every form control across the site. Added a global
  `font-family: inherit` rule plus a small `select.char_level` size fix, so
  the calculator's level selector, buttons and labels now match the rest of
  the theme.
- **Monster zone listings**: rows in `monsters/[zona]` now carry a left-edge
  color accent (`#dcc828` non-aggressive, `#c83232` aggressive, `#3264dc`
  NPC) matching the existing map legend, giving each monster type a subtle
  visual distinction beyond the legend alone.
- **Monster detail pages**: reworked `.monsters_monster_content` on
  `monsters/m[id]` so all stat groups (Stats, Characteristics, Defense,
  Resistance, Other) are shown together with styled section headers and
  dividers, instead of being split across a non-functional "Stats" /
  "Special Drop" tab pair. The always-empty "Special Drop" panel is now
  hidden via `:empty`, and the previously inaccessible Resistance/Other
  block (hidden by a tab-index bug in `monsters.js`) is now visible on all
  ~865 monster pages.
