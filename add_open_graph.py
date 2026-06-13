#!/usr/bin/env python3
"""Adiciona tags Open Graph ao <head> de todas as paginas do site
(Semana 3-4, Tarefa 3), reaproveitando o <title> e a <meta name="description">
ja definidos (Tarefas 1-2).

Tags adicionadas em cada pagina:
  og:site_name  -> "Requiem Online Archive" (fixo)
  og:type       -> "website" (fixo)
  og:url        -> URL absoluta da pagina (BASE_URL + caminho do diretorio)
  og:title      -> mesmo texto do <title>
  og:description -> mesmo valor da <meta name="description">
  og:image      -> BASE_URL + "template/images/logo.png" (logo do header,
                    .header_logo em main.css - unica imagem do site adequada
                    como preview generico de compartilhamento)

Idempotente: paginas que ja tem <meta property="og:site_name"...> sao
ignoradas.

Entrada:
  - index.html, 404.html, about/, calculator/, community/, experience/,
    fitting/, monsters/, quests/, requiem/, weaponry/ (arquivos index.html)

Saida:
  - Os mesmos arquivos, com as 6 meta tags Open Graph inseridas apos a
    <meta name="viewport">

Uso:
  python3 add_open_graph.py
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE_URL = 'https://cleitontf.github.io/requiem-online-archive/'
OG_IMAGE = BASE_URL + 'template/images/logo.png'

SECTIONS = ['about', 'calculator', 'community', 'experience', 'fitting',
            'monsters', 'quests', 'requiem', 'weaponry']

TITLE_RE = re.compile(r'<title>([^<]*)</title>')
DESCRIPTION_RE = re.compile(r'<meta content="([^"]*)" name="description"/>')
VIEWPORT_RE = re.compile(r'(<meta content="width=device-width" name="viewport"/>)')


def og_url_for(rel_path):
    if rel_path == '404.html':
        return BASE_URL + '404.html'
    rel_dir = rel_path[:-len('index.html')]
    return BASE_URL + rel_dir


def build():
    files = [os.path.join(ROOT, '404.html'), os.path.join(ROOT, 'index.html')]
    for section in SECTIONS:
        for dirpath, _, filenames in os.walk(os.path.join(ROOT, section)):
            if 'index.html' in filenames:
                files.append(os.path.join(dirpath, 'index.html'))

    updated = 0
    skipped_existing = 0
    skipped_no_match = 0

    for path in files:
        rel_path = os.path.relpath(path, ROOT).replace(os.sep, '/')
        with open(path, encoding='utf-8') as f:
            html = f.read()

        if 'property="og:site_name"' in html:
            skipped_existing += 1
            continue

        title_m = TITLE_RE.search(html)
        desc_m = DESCRIPTION_RE.search(html)
        viewport_m = VIEWPORT_RE.search(html)
        if not (title_m and desc_m and viewport_m):
            print(f'sem <title>/<meta description>/<meta viewport>: {rel_path}')
            skipped_no_match += 1
            continue

        title = title_m.group(1)
        description = desc_m.group(1)
        og_url = og_url_for(rel_path)

        og_tags = (
            f'\n<meta property="og:site_name" content="Requiem Online Archive"/>'
            f'\n<meta property="og:type" content="website"/>'
            f'\n<meta property="og:url" content="{og_url}"/>'
            f'\n<meta property="og:title" content="{title}"/>'
            f'\n<meta property="og:description" content="{description}"/>'
            f'\n<meta property="og:image" content="{OG_IMAGE}"/>'
        )

        html = VIEWPORT_RE.sub(r'\1' + og_tags, html, count=1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        updated += 1

    print(f'{updated} arquivos atualizados')
    print(f'{skipped_existing} ignorados (Open Graph ja presente)')
    print(f'{skipped_no_match} ignorados (sem title/description/viewport)')


if __name__ == '__main__':
    build()
