#!/usr/bin/env python3
"""Inclui template/js/quests_data.js antes de monsters_data.js em todas as
paginas, para que Search_box (busca global e "Quests in this zone") tenha
acesso a QUESTS_DATA.

Uso:
  python3 add_quests_data_script.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

MONSTERS_TAG = '<script src="template/js/monsters_data.js" type="text/javascript"></script>'
QUESTS_TAG = '<script src="template/js/quests_data.js" type="text/javascript"></script>'

SKIP_DIRS = {'.git', 'template'}


def build():
    updated = 0
    skipped = []

    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for filename in filenames:
            if not filename.endswith('.html'):
                continue
            path = os.path.join(dirpath, filename)
            with open(path, encoding='utf-8') as f:
                html = f.read()

            if QUESTS_TAG in html:
                skipped.append(os.path.relpath(path, ROOT))
                continue

            if MONSTERS_TAG not in html:
                skipped.append(os.path.relpath(path, ROOT))
                continue

            html = html.replace(MONSTERS_TAG, QUESTS_TAG + MONSTERS_TAG, 1)

            with open(path, 'w', encoding='utf-8') as f:
                f.write(html)
            updated += 1

    print(f'{updated} paginas atualizadas')
    print(f'{len(skipped)} paginas sem alteracao:')
    for s in skipped:
        print(f'  {s}')


if __name__ == '__main__':
    build()
