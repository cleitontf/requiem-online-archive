#!/usr/bin/env python3
"""
Generates template/js/monsters_data.js, the dataset behind the global
search box (and reusable later as a normalized monster data source).

Input:
  - monsters/m<id>/index.html for every monster page (name, level, zone,
    dungeon and full stat block are scraped from each page's HTML).

Output:
  - template/js/monsters_data.js (var MONSTERS_DATA = [...], sorted by
    level/name)

Usage (run once, or whenever monster pages change):
  python3 build_monsters_data.py
"""
import os, re, json

MONSTERS_DIR = os.path.join(os.path.dirname(__file__), 'monsters')
OUT_FILE     = os.path.join(os.path.dirname(__file__), 'template', 'js', 'monsters_data.js')

NAME_RE      = re.compile(r'<h3>(.*?)\s*Lvl(\d+)</h3>', re.S)
BREADCRUMB_RE = re.compile(r'main_body_modules_title">\s*(.*?)</div>', re.S)
ZONE_LINK_RE = re.compile(r'<a href="monsters/(\d+)">([^<]*)</a>')
STAT_RE      = re.compile(r'<div class="stat_table_name">(.*?)\s*<div class="stat_table_value">(.*?)</div>', re.S)


def extract(html):
    name, level = '', None
    m = NAME_RE.search(html)
    if m:
        name = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        level = int(m.group(2))

    zone_id = zone_name = dungeon_id = dungeon_name = ''
    m = BREADCRUMB_RE.search(html)
    if m:
        links = ZONE_LINK_RE.findall(m.group(1))
        if len(links) >= 1:
            zone_id, zone_name = links[0]
        if len(links) >= 2:
            dungeon_id, dungeon_name = links[1]

    stats = {}
    for label, value in STAT_RE.findall(html):
        label = re.sub(r'<[^>]+>', '', label).strip()
        value = re.sub(r'<[^>]+>', '', value).strip()
        stats[label] = value

    return name, level, zone_id, zone_name, dungeon_id, dungeon_name, stats


monsters = []
skipped = 0

for entry in sorted(os.listdir(MONSTERS_DIR)):
    if not re.match(r'^m\d+$', entry):
        continue
    path = os.path.join(MONSTERS_DIR, entry, 'index.html')
    if not os.path.exists(path):
        skipped += 1
        continue

    with open(path, encoding='utf-8', errors='replace') as f:
        html = f.read()

    name, level, zone_id, zone_name, dungeon_id, dungeon_name, stats = extract(html)

    if not name or level is None:
        skipped += 1
        continue

    monsters.append({
        'id': entry,             # "m11021"
        'name': name,
        'level': level,
        'zone_id': zone_id,
        'zone_name': zone_name,
        'dungeon_id': dungeon_id,
        'dungeon_name': dungeon_name,
        'stats': stats,
    })

monsters.sort(key=lambda mo: (mo['level'], mo['name']))

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    f.write('var MONSTERS_DATA = ')
    json.dump(monsters, f, ensure_ascii=False, separators=(',', ':'))
    f.write(';\n')

print(f'Done: {len(monsters)} monsters written to {OUT_FILE}')
if skipped:
    print(f'Skipped: {skipped} entries (no valid data)')
