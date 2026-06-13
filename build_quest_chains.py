#!/usr/bin/env python3
"""Adiciona a caixa "Quest Chain" (anterior/proxima quest) nas paginas de
quest individuais, com base em TEMP_Quests_SCV/Quest.csv (Prequest_Index).

A "proxima" quest e calculada pelo inverso de Prequest_Index (quem tem a
quest atual como Prequest_Index). Auto-referencias (Prequest_Index ==
Quest_Index, ex. q57130) sao ignoradas.

Insercao: logo depois do fechamento de <div class="quest_content ...">,
como um novo bloco balanceado (module_action_ + module_list), usando um
parser leve de tags <div> para achar o fim exato do quest_content (a
profundidade de divs varia entre paginas).

ATENCAO: TEMP_Quests_SCV/Quest.csv nao esta versionado (.gitignore). Sem
esse arquivo, este script nao pode ser executado.

Uso:
  python3 build_quest_chains.py
"""
import csv
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

TAG_RE = re.compile(r'<div\b[^>]*>|</div>')


def escape_html(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def load_quests_data():
    path = os.path.join(ROOT, 'template/js/quests_data.js')
    with open(path, encoding='utf-8') as f:
        content = f.read()
    data = json.loads(content[content.index('['):content.rindex(']') + 1])
    return {q['id']: q for q in data}


def build_chains(qd):
    with open(os.path.join(ROOT, 'TEMP_Quests_SCV/Quest.csv'), encoding='latin-1') as f:
        rows = list(csv.DictReader(f))

    children = {}
    prev_of = {}
    for row in rows:
        qid, pid = row['Quest_Index'], row['Prequest_Index']
        if pid == '0' or pid == qid:
            continue
        prev_of[qid] = pid
        children.setdefault(pid, []).append(qid)

    chains = {}
    for qid, pid in prev_of.items():
        q, p = 'q' + qid, 'q' + pid
        if q in qd and p in qd:
            chains.setdefault(q, {})['prev'] = p

    for pid, kids in children.items():
        p = 'q' + pid
        if p not in qd:
            continue
        next_list = ['q' + k for k in kids if ('q' + k) in qd]
        if next_list:
            chains.setdefault(p, {})['next'] = next_list

    return chains


def render_item(label, qid, qd):
    q = qd[qid]
    return (
        '<div class="about_preserved_item"><b>' + label + ':</b> '
        '<a class="about_link" href="quests/' + qid + '">' + escape_html(q['name']) + '</a> '
        '<span class="search_result_meta">Lvl ' + str(q['level']) + ' &middot; ' + escape_html(q['type']) + '</span></div>'
    )


def render_box(chain, qd):
    items = []
    if 'prev' in chain:
        items.append(render_item('Previous', chain['prev'], qd))
    for nxt in chain.get('next', []):
        items.append(render_item('Next', nxt, qd))

    return (
        '<div class="module_action_"></div>'
        '<div class="module_list">'
        '<div class="about_block module_list_border">'
        '<div class="about_section_title">Quest Chain</div>'
        + ''.join(items) +
        '</div>'
        '</div>'
    )


def find_quest_content_end(html):
    start_marker = '<div class="quest_content'
    qc_start = html.index(start_marker)
    open_tag_end = html.index('>', qc_start) + 1
    depth = 1
    for m in TAG_RE.finditer(html, open_tag_end):
        if m.group(0) == '</div>':
            depth -= 1
            if depth == 0:
                return m.end()
        else:
            depth += 1
    return None


def build():
    qd = load_quests_data()
    chains = build_chains(qd)

    updated = 0
    for qid, chain in chains.items():
        path = os.path.join(ROOT, 'quests', qid, 'index.html')
        with open(path, encoding='utf-8') as f:
            html = f.read()

        end = find_quest_content_end(html)
        box = render_box(chain, qd)
        html = html[:end] + box + html[end:]

        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        updated += 1

    print(f'{updated} paginas de quest atualizadas com Quest Chain')
    print(f'{len(qd) - updated} paginas sem dados de cadeia (sem alteracao)')


if __name__ == '__main__':
    build()
