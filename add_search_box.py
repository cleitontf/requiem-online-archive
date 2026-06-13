#!/usr/bin/env python3
"""Adiciona a busca global (input + dropdown de resultados) na sidebar de
navegacao de todas as paginas, e inclui os scripts monsters_data.js e
search.js.

1. Insere o markup da busca logo no inicio de
   <div class="main_body_content_info_"> (acima do bloco "Navigation").

2. Insere as tags <script> de monsters_data.js e search.js antes de
   </head> (funciona mesmo nas paginas com bloco de scripts atipico).

Uso:
  python3 add_search_box.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

SEARCH_BOX = (
    '<div class="search_box">'
    '<input id="global_search_input" type="text" placeholder="Search quests, monsters, classes..." autocomplete="off"/>'
    '<div id="global_search_results" class="search_results"></div>'
    '</div>'
)

NAV_OLD = '<div class="main_body_content_info_">\n<h4>'
NAV_NEW = '<div class="main_body_content_info_">\n' + SEARCH_BOX + '\n<h4>'

SCRIPTS = (
    '<script src="template/js/monsters_data.js" type="text/javascript"></script>'
    '<script src="template/js/search.js" type="text/javascript"></script>'
    '</head>'
)

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

            if NAV_OLD not in html:
                skipped.append(os.path.relpath(path, ROOT))
                continue

            html = html.replace(NAV_OLD, NAV_NEW, 1)
            html = html.replace('</head>', SCRIPTS, 1)

            with open(path, 'w', encoding='utf-8') as f:
                f.write(html)
            updated += 1

    print(f'{updated} paginas atualizadas')
    print(f'{len(skipped)} paginas sem o bloco de navegacao padrao (nao alteradas):')
    for s in skipped:
        print(f'  {s}')


if __name__ == '__main__':
    build()
