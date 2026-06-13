# Contributing

This project preserves a static archive of the *Requiem Online* community
knowledge base. Contributions of all kinds are welcome — from reporting a
typo to fixing broken data across many pages.

## Reporting a problem (no code required)

If you spot wrong information, a broken image, a missing icon, or untranslated
text, please [open an Issue](https://github.com/cleitontf/requiem-online-archive/issues/new)
with:

- A title in the format `[section] short description`, e.g.
  `[quests] q12345 has the wrong reward item` or
  `[calculator] Ranger skill tree missing icon for Bullseye`
- The page URL (or path, e.g. `quests/q12345/`)
- What's wrong and, if you know it, what the correct value should be

## Contributing a fix (with code)

1. Fork the repository
2. Edit the HTML of the affected page(s) directly — most fixes are simple
   text/markup changes in `*/index.html`
3. Open a Pull Request with a title in the format `fix: <what was fixed>`,
   e.g. `fix: correct reward item for quest q12345`

Keep PRs focused — one kind of fix per PR makes review much easier.

## Running locally

```bash
git clone https://github.com/cleitontf/requiem-online-archive.git
cd requiem-online-archive
python3 serve.py
```

This starts a local server at `http://localhost:8000` and opens the site in
your browser. No other dependencies are required.

## Regenerating data files

The `template/js/*_data.js` files are generated from source data by the
`build_*.py` scripts and are committed to the repo, so you normally **don't**
need to run them. Re-run them only if you change their inputs:

- **`build_quests_data.py`** — re-run after editing the level, location, type,
  or title of any `quests/q<id>/index.html` page, so the quest list's
  search/filter/pagination reflects the change:
  ```bash
  python3 build_quests_data.py
  ```
- **`build_calculator_arrows.py`** — re-run after changing a calculator
  class's skill grid or adding/moving dependency arrows in
  `template/images/main.css`, so `skills_data.json`/`skills_data.js` stay in
  sync with the HTML:
  ```bash
  python3 build_calculator_arrows.py
  ```

`build_quest_rewards_data.py` requires raw game CSVs (`Quest.csv`,
`ItemAsset.csv`) that are not included in this repo, so it generally can't be
re-run by contributors — quest reward fixes should be made directly in
`template/js/quest_rewards_data.js` or the relevant quest page.

## Scope

This archive aims to stay a **pure static site** — no server-side code, no
database, no login system.

**We accept:**
- Corrections to existing content (text, stats, translations, links, icons)
- Fixes to broken layout, scripts, or data on existing pages
- New static assets (icons, images) needed by existing pages

**We don't accept:**
- Re-adding `/experience/`, `/fitting/`, or `/weaponry/` — these sections were
  removed because they depended on item/weapon databases and AJAX endpoints
  that aren't available in this archive. They can only come back alongside
  the actual source data (see [Known limitations](README.md#known-limitations))
- Any change that reintroduces a server-side dependency (database, backend
  API, login/session system)
