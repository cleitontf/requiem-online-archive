#!/usr/bin/env python3
"""Renomeia os itens do dropdown "Copy" nas 24 paginas calculator/<classe>/:

  Link    -> Share Build
  Summary -> Copy Summary
  Export  -> Export Skill List

Uso:
  python3 rename_copy_menu_items.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

REPLACEMENTS = [
    (
        '<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_link()">Link</div>',
        '<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_link()">Share Build</div>',
    ),
    (
        '<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_summary()">Summary</div>',
        '<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_summary()">Copy Summary</div>',
    ),
    (
        '<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_export()">Export</div>',
        '<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_export()">Export Skill List</div>',
    ),
]


def build():
    updated = []
    skipped = []

    for entry in sorted(os.listdir(os.path.join(ROOT, 'calculator'))):
        path = os.path.join(ROOT, 'calculator', entry, 'index.html')
        if not os.path.isfile(path):
            continue

        with open(path, encoding='utf-8') as f:
            html = f.read()

        if not all(old in html for old, _ in REPLACEMENTS):
            skipped.append(entry)
            continue

        for old, new in REPLACEMENTS:
            html = html.replace(old, new, 1)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        updated.append(entry)

    print(f'{len(updated)} paginas atualizadas: {updated}')
    print(f'{len(skipped)} paginas sem o bloco esperado: {skipped}')


if __name__ == '__main__':
    build()
