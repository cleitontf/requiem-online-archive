#!/usr/bin/env python3
"""Adiciona o link "Game Guide" (guide/) ao menu de navegacao lateral de
todas as paginas do site, entre "Calculator" e "Monsters".

Substitui a ocorrencia de
  <a href="calculator">Calculator</a></div><div class="main_body_content_info_links"><div class="bullet"></div><a href="monsters">Monsters</a>
por
  <a href="calculator">Calculator</a></div><div class="main_body_content_info_links"><div class="bullet"></div><a href="guide">Game Guide</a></div><div class="main_body_content_info_links"><div class="bullet"></div><a href="monsters">Monsters</a>

guide/index.html ja foi criado com o menu atualizado, entao nao sera
duplicado (o padrao OLD nao ocorre nele).

Uso:
  python3 add_guide_nav_link.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

OLD = ('<a href="calculator">Calculator</a></div>'
       '<div class="main_body_content_info_links"><div class="bullet"></div>'
       '<a href="monsters">Monsters</a>')
NEW = ('<a href="calculator">Calculator</a></div>'
       '<div class="main_body_content_info_links"><div class="bullet"></div>'
       '<a href="guide">Game Guide</a></div>'
       '<div class="main_body_content_info_links"><div class="bullet"></div>'
       '<a href="monsters">Monsters</a>')

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

            if OLD in html:
                html = html.replace(OLD, NEW)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(html)
                updated += 1
            else:
                skipped.append(os.path.relpath(path, ROOT))

    print(f'{updated} paginas atualizadas')
    print(f'{len(skipped)} paginas sem o menu padrao (nao alteradas):')
    for s in skipped:
        print(f'  {s}')


if __name__ == '__main__':
    build()
