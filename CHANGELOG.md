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
