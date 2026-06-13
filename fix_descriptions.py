#!/usr/bin/env python3
"""Substitui a <meta name="description"> generica (igual em todas as paginas,
mesmo texto da <meta name="keywords">) por descricoes especificas por pagina,
para SEO (Semana 3-4, Tarefa 2).

So altera arquivos cuja description ainda for exatamente o texto padrao -
paginas ja customizadas e secoes principais (editadas manualmente nesta
tarefa) sao ignoradas automaticamente. Paginas de filtro de quests (sem nome
de quest proprio) e quests sem conteudo (ex.: q44790) tambem sao ignoradas.

Padroes de description gerados:
  - calculator/<slug>/index.html (e subpaginas) ->
    "Skill calculator for {Classe} — Requiem Online. Build your skill tree and share the link."
  - monsters/m<id>/index.html ->
    "{Monstro} — Level {nivel}, Zone {zona}. Stats and drops on the Requiem Online Archive."
  - monsters/<zona>/index.html ->
    "Monsters of {Zona} — Requiem Online. Full list with levels and types."
  - quests/q<id>/index.html ->
    "Quest: {Quest} — Level {nivel}, Location {local}. Full guide on the Requiem Online Archive."

Entrada:
  - calculator/, monsters/, quests/ (arquivos index.html)

Saida:
  - Os mesmos arquivos, com <meta name="description"> atualizada in-place

Uso:
  python3 fix_descriptions.py
"""
import html
import os
import re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.abspath(__file__))
GENERIC_TEXT = ('Requiem Online, knowledge base, talent calculator, guides, '
                'hardcore bloody MMO RPG, free online game, multiplayer game')
DEFAULT_DESCRIPTION = f'<meta content="{GENERIC_TEXT}" name="description"/>'

ZONE_HREF_RE = re.compile(r'^monsters/(\d+)$')
LEVEL_SUFFIX_RE = re.compile(r'\s*Lvl(\d+)$')


class PageExtractor(HTMLParser):
    """Coleta h1/h3, divs-folha (sem filhos) e o id de zona referenciado
    pelo primeiro link <a href="monsters/<id>"> (breadcrumb dos monstros)."""

    def __init__(self):
        super().__init__()
        self.h1 = []
        self.h3 = []
        self.leaf_divs = []
        self.zone_id = None
        self._stack = []

    def handle_starttag(self, tag, attrs):
        attrs_d = dict(attrs)
        if tag == 'a' and self.zone_id is None:
            m = ZONE_HREF_RE.match(attrs_d.get('href', ''))
            if m:
                self.zone_id = m.group(1)
        if tag in ('h1', 'h3', 'div'):
            self._stack.append([tag, attrs_d.get('class', ''), []])

    def handle_endtag(self, tag):
        if tag in ('h1', 'h3', 'div') and self._stack and self._stack[-1][0] == tag:
            t, cls, parts = self._stack.pop()
            text = ''.join(parts).strip()
            if t == 'h1' and text:
                self.h1.append(text)
            elif t == 'h3' and text:
                self.h3.append(text)
            elif t == 'div':
                self.leaf_divs.append((cls, text))

    def handle_data(self, data):
        if self._stack:
            self._stack[-1][2].append(data)


def quest_field(leaf_divs, label):
    for i, (cls, text) in enumerate(leaf_divs):
        if cls == 'quest_quest_title' and text == label and i + 1 < len(leaf_divs):
            return leaf_divs[i + 1][1]
    return None


def build_zone_names():
    """Mapeia id de zona (nome do diretorio monsters/<id>/) -> nome da zona,
    lido do <title> ja gerado pela Tarefa 1 ("{Zona} — Monsters | Requiem Online")."""
    names = {}
    for entry in os.listdir(os.path.join(ROOT, 'monsters')):
        if not entry.isdigit():
            continue
        path = os.path.join(ROOT, 'monsters', entry, 'index.html')
        if not os.path.isfile(path):
            continue
        m = re.search(r'<title>(.*?) — Monsters \| Requiem Online</title>',
                       open(path, encoding='utf-8').read())
        if m:
            names[entry] = m.group(1)
    return names


def new_description_for(rel_path, html_text, zone_names):
    parts = rel_path.split('/')

    if parts[0] == 'calculator' and rel_path != 'calculator/index.html':
        ex = PageExtractor()
        ex.feed(html_text)
        if not ex.h3:
            return None
        name = html.escape(ex.h3[0], quote=True)
        return (f'Skill calculator for {name} — Requiem Online. '
                f'Build your skill tree and share the link.')

    if parts[0] == 'monsters' and rel_path != 'monsters/index.html':
        if parts[1].isdigit():
            zone_name = zone_names.get(parts[1])
            if not zone_name:
                return None
            return (f'Monsters of {html.escape(zone_name, quote=True)} — Requiem Online. '
                    f'Full list with levels and types.')

        ex = PageExtractor()
        ex.feed(html_text)
        if not ex.h3 or ex.zone_id is None:
            return None
        m = LEVEL_SUFFIX_RE.search(ex.h3[0])
        if not m:
            return None
        level = m.group(1)
        name = LEVEL_SUFFIX_RE.sub('', ex.h3[0])
        zone_name = zone_names.get(ex.zone_id)
        if not zone_name:
            return None
        return (f'{html.escape(name, quote=True)} — Level {level}, '
                f'Zone {html.escape(zone_name, quote=True)}. '
                f'Stats and drops on the Requiem Online Archive.')

    if parts[0] == 'quests' and rel_path != 'quests/index.html':
        if not (parts[1].startswith('q') and parts[1][1:].isdigit()):
            return None
        ex = PageExtractor()
        ex.feed(html_text)
        if not ex.h1:
            return None
        level = quest_field(ex.leaf_divs, 'Lvl')
        location = quest_field(ex.leaf_divs, 'Location')
        if level is None or location is None:
            return None
        name = html.escape(ex.h1[0], quote=True)
        location = html.escape(location, quote=True)
        return (f'Quest: {name} — Level {level}, Location {location}. '
                f'Full guide on the Requiem Online Archive.')

    return None


def build():
    zone_names = build_zone_names()

    updated = 0
    ignored_custom = 0
    no_data = 0

    for section in ('calculator', 'monsters', 'quests'):
        for dirpath, _, filenames in os.walk(os.path.join(ROOT, section)):
            if 'index.html' not in filenames:
                continue
            path = os.path.join(dirpath, 'index.html')
            rel_path = os.path.relpath(path, ROOT).replace(os.sep, '/')

            with open(path, encoding='utf-8') as f:
                html_text = f.read()

            if DEFAULT_DESCRIPTION not in html_text:
                ignored_custom += 1
                continue

            description = new_description_for(rel_path, html_text, zone_names)
            if description is None:
                no_data += 1
                continue

            new_meta = f'<meta content="{description}" name="description"/>'
            html_text = html_text.replace(DEFAULT_DESCRIPTION, new_meta, 1)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(html_text)
            updated += 1

    print(f'{updated} arquivos atualizados')
    print(f'{ignored_custom} ignorados (description ja customizada)')
    print(f'{no_data} ignorados (sem dados para gerar description)')


if __name__ == '__main__':
    build()
