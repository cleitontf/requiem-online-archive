#!/usr/bin/env python3
"""Adiciona data-name, data-level e data-url a cada marcador numerico do mapa
de zona (monsters/<zoneid>/index.html), para alimentar o tooltip e o link de
clique implementados em template/js/monsters.js (Mes 2, Tarefa 1).

Para cada marcador <div class="monsters_map_monsters monster_<id>_checked"
style="..." title="...">N</div>, le monsters/m<id>/index.html para obter nome
e nivel (do <h3>Nome LvlXX</h3>) e substitui o atributo title por:
  data-name="Nome"
  data-level="Lvl XX"
  data-url="monsters/m<id>"

Uso:
  python3 add_map_marker_data.py
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

MARKER_RE = re.compile(
    r'<div class="monsters_map_monsters (monster_(\d+)_checked)"'
    r'(\s*style="[^"]*")\s*title="[^"]*">'
)

H3_RE = re.compile(r'<h3>(.*) Lvl(\d+)</h3>')


def monster_info(mid, cache):
    if mid not in cache:
        path = os.path.join(ROOT, 'monsters', f'm{mid}', 'index.html')
        html = open(path, encoding='utf-8').read()
        m = H3_RE.search(html)
        cache[mid] = (m.group(1), m.group(2))
    return cache[mid]


def build():
    cache = {}
    updated_zones = 0
    updated_markers = 0

    for entry in sorted(os.listdir(os.path.join(ROOT, 'monsters'))):
        if not entry.isdigit():
            continue
        path = os.path.join(ROOT, 'monsters', entry, 'index.html')
        with open(path, encoding='utf-8') as f:
            html = f.read()

        def repl(m):
            nonlocal updated_markers
            cls, mid, style = m.group(1), m.group(2), m.group(3)
            name, level = monster_info(mid, cache)
            updated_markers += 1
            return (f'<div class="monsters_map_monsters {cls}"{style} '
                    f'data-name="{name}" data-level="Lvl {level}" '
                    f'data-url="monsters/m{mid}">')

        new_html, n = MARKER_RE.subn(repl, html)
        if n:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_html)
            updated_zones += 1

    print(f'{updated_zones} zonas atualizadas')
    print(f'{updated_markers} marcadores atualizados')


if __name__ == '__main__':
    build()
