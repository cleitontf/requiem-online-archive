#!/usr/bin/env python3
"""Preenche requirement[1] (id da seta HTML) e requirement[2] (tipo numerico)
em template/js/skills_data.json.

Para cada par (skill, pre-requisito), calcula o ponto medio esperado da seta
que os conecta a partir das posicoes dos icones na grade da calculadora
(48px por celula, icone 36x36 com offset de 7px), e casa com a seta real
mais proxima (posicao/tamanho lidos de main.css e do HTML de cada classe).

Entrada:
  - template/js/skills_data.json (skills + requirement[0] de cada classe)
  - template/images/main.css (posicao/tamanho das setas .calculator_arrowN)
  - calculator/<class_slug>/index.html (grade de skills e setas de cada classe;
    CLASS_DIRS mapeia o id numerico da classe para o nome da pasta)

Saida (sobrescritos):
  - template/js/skills_data.json
  - template/js/skills_data.js (mesma estrutura, exposta como var SKILLS_DATA
    para funcionar em paginas abertas via file://)

Uso:
  python3 build_calculator_arrows.py
"""
import json
import re

ROOT_CSS = 'template/images/main.css'
SKILLS_DATA = 'template/js/skills_data.json'
SKILLS_DATA_JS = 'template/js/skills_data.js'

ARROW_DIM = {1: (64, 32), 2: (16, 32), 3: (16, 16), 4: (32, 64), 5: (32, 16),
              6: (16, 16), 7: (16, 32), 8: (64, 32), 9: (32, 128), 10: (32, 96)}

# Mapeia o id numerico de cada classe (chaves de skills_data.json) para o nome
# da pasta em calculator/, usado desde a Semana 2 (URLs legiveis por slug).
CLASS_DIRS = {
    '2': 'defender', '3': 'commander', '4': 'protector',
    '6': 'templar', '7': 'tempest', '8': 'radiant',
    '12': 'warrior', '13': 'berserker', '14': 'warlord',
    '16': 'shaman', '17': 'forsaker', '18': 'mystic',
    '32': 'rogue', '33': 'shadowrunner', '34': 'assassin',
    '36': 'soulhunter', '37': 'defiler', '38': 'dominator',
    '22': 'hunter', '23': 'avenger', '24': 'ranger',
    '26': 'battle-magician', '27': 'druid', '28': 'elementalist',
}

CSS = open(ROOT_CSS).read()
MATCH_THRESHOLD = 25  # px, distancia maxima entre seta esperada e seta real


def get_grid(cls):
    html = open(f'calculator/{CLASS_DIRS[cls]}/index.html').read()
    table = re.search(r'<table class="calculator_skills_sheet">(.*?)</table>', html, re.S).group(1)
    # A secao DNA fica em linhas separadas, sem setas de pre-requisito;
    # ignora-las evita casamentos espurios com setas da grade de skills.
    table = table.split('<td colspan="7">')[0]
    grid = {}
    for r_idx, row in enumerate(re.findall(r'<tr>(.*?)</tr>', table, re.S)):
        for c_idx, cell in enumerate(re.findall(r'<td class="skill_info_"[^>]*>(.*?)</td>', row, re.S)):
            idm = re.search(r'class="skill" id="(\d+)"', cell)
            if idm:
                grid[int(idm.group(1))] = (r_idx, c_idx)
    return grid


def get_arrows(cls):
    html = open(f'calculator/{CLASS_DIRS[cls]}/index.html').read()
    out = []
    for atype, aid in re.findall(r'<div class="calculator_arrow(\d+)" id="(\w+)"', html):
        body = re.search(rf'#{aid}\s*\{{([^}}]*)\}}', CSS).group(1)
        top = int(re.search(r'top:\s*(-?\d+)px', body).group(1))
        left = int(re.search(r'left:\s*(-?\d+)px', body).group(1))
        atype = int(atype)
        w, h = ARROW_DIM[atype]
        out.append({'id': aid, 'type': atype, 'cx': left + w / 2, 'cy': top + h / 2})
    return out


def icon_box(row, col):
    x0, y0 = col * 48 + 7, row * 48 + 7
    return x0, y0, x0 + 36, y0 + 36


def expected_center(self_rc, prereq_rc):
    sx0, sy0, sx1, sy1 = icon_box(*self_rc)
    px0, py0, px1, py1 = icon_box(*prereq_rc)
    dr, dc = self_rc[0] - prereq_rc[0], self_rc[1] - prereq_rc[1]

    ey = (py1 + sy0) / 2 if dr > 0 else (sy1 + py0) / 2 if dr < 0 else (sy0 + sy1) / 2
    ex = (px1 + sx0) / 2 if dc > 0 else (sx1 + px0) / 2 if dc < 0 else (sx0 + sx1) / 2
    return ex, ey


def match_class(cls, data):
    grid = get_grid(cls)
    arrows = get_arrows(cls)

    pairs = []
    for s in data[cls]:
        if s['requirement'] != '':
            prereq = s['requirement'][0]
            if s['id'] in grid and prereq in grid:
                pairs.append((s['id'], grid[s['id']], grid[prereq]))

    triples = []
    for pi, (sid, srtc, prrc) in enumerate(pairs):
        ex, ey = expected_center(srtc, prrc)
        for ai, a in enumerate(arrows):
            cost = abs(a['cx'] - ex) + abs(a['cy'] - ey)
            if cost <= MATCH_THRESHOLD:
                triples.append((cost, pi, ai))
    triples.sort()

    used_p, used_a, result = set(), set(), {}
    for cost, pi, ai in triples:
        if pi in used_p or ai in used_a:
            continue
        used_p.add(pi)
        used_a.add(ai)
        sid = pairs[pi][0]
        result[sid] = (arrows[ai]['id'], arrows[ai]['type'])

    return result


def build():
    data = json.load(open(SKILLS_DATA))

    total = 0
    for cls, skills in data.items():
        result = match_class(cls, data)
        by_id = {s['id']: s for s in skills}
        for sid, (aid, atype) in result.items():
            s = by_id[sid]
            s['requirement'] = [s['requirement'][0], aid, atype]
            total += 1

    with open(SKILLS_DATA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    # skills_data.js is what the site actually loads (works under file://)
    with open(SKILLS_DATA_JS, 'w', encoding='utf-8') as f:
        f.write('var SKILLS_DATA = ')
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')

    print(f'{total} skills atualizados com requirement[1]/[2] em {SKILLS_DATA} e {SKILLS_DATA_JS}')


if __name__ == '__main__':
    build()
