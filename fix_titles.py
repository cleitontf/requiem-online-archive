#!/usr/bin/env python3
"""Substitui o <title> padrao ("Requiem Online — Knowledge Base") por titulos
especificos por pagina, para SEO (Semana 3-4, Tarefa 1).

So altera arquivos cujo <title> ainda for exatamente o texto padrao - paginas
ja customizadas (404.html, experience/, fitting/, weaponry/, secoes
principais editadas manualmente) sao ignoradas automaticamente.

Padroes de titulo gerados:
  - calculator/<slug>/index.html (e subpaginas)  -> "{Classe} — Skill Calculator | Requiem Online"
  - monsters/m<id>/index.html                    -> "{Monstro} — Monsters | Requiem Online"
  - monsters/<zona>/index.html                   -> "{Zona} — Monsters | Requiem Online"
  - quests/q<id>/index.html                      -> "{Quest} — Quests | Requiem Online"
  - quests/<codigo>/index.html (paginas de filtro, sem nome de quest proprio)
                                                  -> "Quest Guide — Requiem Online"

Entrada:
  - calculator/, monsters/, quests/ (arquivos index.html)

Saida:
  - Os mesmos arquivos, com <title> atualizado in-place

Uso:
  python3 fix_titles.py
"""
import os
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TITLE = '<title>Requiem Online — Knowledge Base</title>'
QUEST_LIST_TITLE = '<title>Quest Guide — Requiem Online</title>'


class HeadingExtractor(HTMLParser):
    """Coleta o texto de todas as tags <h1> e <h3> do documento."""

    def __init__(self):
        super().__init__()
        self.h1 = []
        self.h3 = []
        self._stack = []

    def handle_starttag(self, tag, attrs):
        if tag in ('h1', 'h3'):
            self._stack.append((tag, []))

    def handle_endtag(self, tag):
        if tag in ('h1', 'h3') and self._stack and self._stack[-1][0] == tag:
            t, parts = self._stack.pop()
            text = ''.join(parts).strip()
            if text:
                getattr(self, t).append(text)

    def handle_data(self, data):
        if self._stack:
            self._stack[-1][1].append(data)


def new_title_for(rel_path, html):
    parts = rel_path.split('/')

    if parts[0] == 'calculator' and rel_path != 'calculator/index.html':
        ex = HeadingExtractor()
        ex.feed(html)
        if not ex.h3:
            return None
        return f'<title>{ex.h3[0]} — Skill Calculator | Requiem Online</title>'

    if parts[0] == 'monsters' and rel_path != 'monsters/index.html':
        ex = HeadingExtractor()
        ex.feed(html)
        if not ex.h3:
            return None
        return f'<title>{ex.h3[0]} — Monsters | Requiem Online</title>'

    if parts[0] == 'quests' and rel_path != 'quests/index.html':
        # Paginas de quest individual (q<id>/) tem o nome em <h1>;
        # paginas de filtro/listagem nao tem - usam o mesmo titulo da lista.
        if parts[1].startswith('q') and parts[1][1:].isdigit():
            ex = HeadingExtractor()
            ex.feed(html)
            if not ex.h1:
                return None
            return f'<title>{ex.h1[0]} — Quests | Requiem Online</title>'
        return QUEST_LIST_TITLE

    return None


def build():
    updated = 0
    ignored_custom = 0
    no_name = 0

    for section in ('calculator', 'monsters', 'quests'):
        for dirpath, _, filenames in os.walk(os.path.join(ROOT, section)):
            if 'index.html' not in filenames:
                continue
            path = os.path.join(dirpath, 'index.html')
            rel_path = os.path.relpath(path, ROOT).replace(os.sep, '/')

            with open(path, encoding='utf-8') as f:
                html = f.read()

            if DEFAULT_TITLE not in html:
                ignored_custom += 1
                continue

            new_title = new_title_for(rel_path, html)
            if new_title is None:
                if rel_path not in (f'{section}/index.html',):
                    print(f'sem titulo extraido: {rel_path}')
                no_name += 1
                continue

            html = html.replace(DEFAULT_TITLE, new_title, 1)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(html)
            updated += 1

    print(f'{updated} arquivos atualizados')
    print(f'{ignored_custom} ignorados (titulo ja customizado)')
    print(f'{no_name} ignorados (sem nome extraido)')


if __name__ == '__main__':
    build()
