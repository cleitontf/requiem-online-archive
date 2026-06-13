#!/usr/bin/env python3
"""
Generates template/js/quests_data.js, the dataset behind the quest list's
client-side search/filter/pagination on quests/index.html.

Input:
  - quests/q<id>/index.html for every quest page (name, level, location, type
    are scraped from each page's HTML).

Output:
  - template/js/quests_data.js (var QUESTS_DATA = [...], sorted by level/name)

Usage (run once, or whenever quest pages change):
  python3 build_quests_data.py
"""
import os, re, json

QUESTS_DIR = os.path.join(os.path.dirname(__file__), 'quests')
OUT_FILE   = os.path.join(os.path.dirname(__file__), 'template', 'js', 'quests_data.js')

def extract(html):
    name = ''
    m = re.search(r'class="quest_quest_names">\s*<h1>(.*?)</h1>', html, re.S)
    if m:
        name = re.sub(r'<[^>]+>', '', m.group(1)).strip()

    level = ''
    m = re.search(r'class="quest_quest_title">Lvl</div>\s*<div>(.*?)</div>', html, re.S)
    if m:
        level = m.group(1).strip()

    location = ''
    m = re.search(r'class="quest_quest_title">Location</div>\s*<div>(.*?)</div>', html, re.S)
    if m:
        location = m.group(1).strip()

    qtype = ''
    m = re.search(r'class="quest_quest_title">Type</div>\s*<div>(.*?)</div>', html, re.S)
    if m:
        qtype = m.group(1).strip()

    return name, level, location, qtype


quests = []
skipped = 0

for entry in sorted(os.listdir(QUESTS_DIR)):
    if not re.match(r'^q\d+$', entry):
        continue
    path = os.path.join(QUESTS_DIR, entry, 'index.html')
    if not os.path.exists(path):
        skipped += 1
        continue

    with open(path, encoding='utf-8', errors='replace') as f:
        html = f.read()

    name, level, location, qtype = extract(html)

    if not name or not level:
        skipped += 1
        continue

    try:
        lvl = int(level)
    except ValueError:
        skipped += 1
        continue

    if qtype == 'Quest Scroll':
        qtype = 'Cround'

    quests.append({
        'id':  entry,           # "q4340"
        'name': name,
        'level': lvl,
        'location': location,
        'type': qtype,
    })

quests.sort(key=lambda q: (q['level'], q['name']))

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    f.write('var QUESTS_DATA = ')
    json.dump(quests, f, ensure_ascii=False, separators=(',', ':'))
    f.write(';\n')

print(f'Done: {len(quests)} quests written to {OUT_FILE}')
if skipped:
    print(f'Skipped: {skipped} entries (no valid data)')
