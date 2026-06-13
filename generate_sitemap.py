#!/usr/bin/env python3
"""Gera sitemap.xml para o site (Semana 3-4, Tarefa 4).

Percorre recursivamente as pastas listadas em SECTIONS (e o index.html da
raiz) procurando arquivos index.html, e gera uma entrada <url> para cada
pagina encontrada, com prioridade de acordo com o tipo de pagina:

  1.0 -> pagina inicial (index.html da raiz)
  0.8 -> secoes principais (calculator/, monsters/, quests/, about/,
         community/)
  0.6 -> paginas de zona (monsters/<zona>/) e de classe (calculator/<classe>/,
         incluindo builds salvos)
  0.5 -> paginas individuais (quests/q<id>/, monsters/m<id>/, paginas de
         filtro de quests)

Pastas excluidas (nao fazem parte do site publicado ou nao tem conteudo
proprio): experience/, fitting/, weaponry/, template/, requiem/, e
monsters/m0/ (stub "Page Not Found", equivalente ao 404.html).

Uso:
  python3 generate_sitemap.py
"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE_URL = 'https://cleitontf.github.io/requiem-online-archive/'

SECTIONS = ['calculator', 'monsters', 'quests', 'about', 'community']

EXCLUDE_DIRS = {os.path.join(ROOT, 'monsters', 'm0')}


def priority_for(rel_dir):
    if rel_dir == '':
        return '1.0'

    parts = rel_dir.split('/')
    if len(parts) == 1:
        return '0.8'

    section, name = parts[0], parts[1]
    if section == 'calculator':
        return '0.6'
    if section == 'monsters':
        return '0.6' if name.isdigit() else '0.5'
    if section == 'quests':
        return '0.5'
    return '0.5'


def build():
    urls = [(BASE_URL, priority_for(''))]

    for section in SECTIONS:
        for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, section)):
            if dirpath in EXCLUDE_DIRS:
                dirnames[:] = []
                continue
            if 'index.html' not in filenames:
                continue
            rel_dir = os.path.relpath(dirpath, ROOT).replace(os.sep, '/')
            url = BASE_URL + rel_dir + '/'
            urls.append((url, priority_for(rel_dir)))

    urls.sort(key=lambda u: u[0])

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, priority in urls:
        lines.append('  <url>')
        lines.append(f'    <loc>{url}</loc>')
        lines.append(f'    <priority>{priority}</priority>')
        lines.append('  </url>')
    lines.append('</urlset>')

    with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    print(f'{len(urls)} URLs no sitemap.xml')


if __name__ == '__main__':
    build()
