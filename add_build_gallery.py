#!/usr/bin/env python3
"""Adiciona o botao "Save build" e o painel "My Builds"
(.calculator_build_list, preenchido via localStorage por
Calculator_box.build_list()) nas 24 paginas calculator/<classe>/.

Uso:
  python3 add_build_gallery.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

OLD = (
    '<button type="button" class="calculator_reset_btn" onclick="Calculator_box.reset()">Reset build</button>\n'
    '<div class="calculator_copy_dropdown" id="calc_copy_dropdown">\n'
    '\t<button type="button" class="calculator_reset_btn" id="calc_copy_btn" onclick="Calculator_box.toggle_copy_menu(event)">Copy &#9662;</button>\n'
    '\t<div class="calculator_copy_menu" id="calc_copy_menu">\n'
    '\t\t<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_link()">Link</div>\n'
    '\t\t<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_summary()">Summary</div>\n'
    '\t\t<div class="calculator_copy_menu_item" onclick="Calculator_box.copy_export()">Export</div>\n'
    '\t</div>\n'
    '</div>\n'
    '</div></form>'
)

BUILD_LIST = (
    '<div class="calculator_build_list">\n'
    '<div class="calculator_build_list_title">My Builds</div>\n'
    '<button type="button" class="calculator_reset_btn calculator_save_btn" onclick="Calculator_box.save_build()">Save build</button>\n'
    '<div class="calculator_build_list_items" id="calc_build_list_items"></div>\n'
    '<div class="calculator_build_list_hint">Saved locally in this browser - not synced across devices.</div>\n'
    '</div>'
)

NEW = OLD + '\n' + BUILD_LIST


def build():
    updated = []
    skipped = []

    for entry in sorted(os.listdir(os.path.join(ROOT, 'calculator'))):
        path = os.path.join(ROOT, 'calculator', entry, 'index.html')
        if not os.path.isfile(path):
            continue

        with open(path, encoding='utf-8') as f:
            html = f.read()

        if OLD not in html:
            skipped.append(entry)
            continue

        html = html.replace(OLD, NEW, 1)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        updated.append(entry)

    print(f'{len(updated)} paginas atualizadas: {updated}')
    print(f'{len(skipped)} paginas sem o bloco esperado: {skipped}')


if __name__ == '__main__':
    build()
