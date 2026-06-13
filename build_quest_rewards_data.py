#!/usr/bin/env python3
"""Gera /template/js/quest_rewards_data.js a partir de Quest.csv + ItemAsset.csv.

Mapeia quest_id -> lista de itens de recompensa (auto + select), com
icone, nome e quantidade, para o Quest_box.reward_load() renderizar.

Entrada:
  - TEMP_Quests_SCV/Quest.csv (dados de recompensa por quest)
  - TEMP_Itens_CSV/ItemAsset.csv (nome/icone de cada item)
  - quests/q<id>/ (usado so para filtrar quests que existem no archive)

  ATENCAO: Quest.csv e ItemAsset.csv sao dados brutos do jogo e NAO estao
  versionados neste repositorio (.gitignore). Sem esses arquivos em
  TEMP_Quests_SCV/ e TEMP_Itens_CSV/, este script nao pode ser executado.

Saida:
  - template/js/quest_rewards_data.js (var QUEST_REWARDS_DATA = {...})

Uso:
  python3 build_quest_rewards_data.py
"""
import csv
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


def load_items():
    items = {}
    with open(os.path.join(ROOT, 'TEMP_Itens_CSV/ItemAsset.csv'), encoding='latin-1') as f:
        for row in csv.DictReader(f):
            items[int(row['Index'])] = {
                'name': row['Name'].replace('%%', '%'),
                'icon': row['Image_Icon'],
            }
    return items


def existing_quest_ids():
    ids = set()
    for d in os.listdir(os.path.join(ROOT, 'quests')):
        if d.startswith('q') and d[1:].isdigit():
            ids.add(int(d[1:]))
    return ids


def build():
    items = load_items()
    existing = existing_quest_ids()
    data = {}

    with open(os.path.join(ROOT, 'TEMP_Quests_SCV/Quest.csv'), encoding='latin-1') as f:
        for row in csv.DictReader(f):
            qid = int(row['Quest_Index'])
            if qid not in existing:
                continue

            rewards = []

            auto_idx = int(row['Reward_Item_Auto_Index'])
            if auto_idx and auto_idx in items:
                rewards.append({
                    'icon': items[auto_idx]['icon'],
                    'name': items[auto_idx]['name'],
                    'amount': int(row['Reward_Item_Auto_Amount']),
                    'type': 'auto',
                })

            for i in range(1, 8):
                sel_idx = int(row[f'Reward_Item_Select_Index{i}'])
                if sel_idx and sel_idx in items:
                    rewards.append({
                        'icon': items[sel_idx]['icon'],
                        'name': items[sel_idx]['name'],
                        'amount': int(row[f'Reward_Item_Select_Amount{i}']),
                        'type': 'select',
                    })

            if rewards:
                data[qid] = rewards

    out_path = os.path.join(ROOT, 'template/js/quest_rewards_data.js')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('var QUEST_REWARDS_DATA = ')
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')

    print(f'{len(data)} quests com recompensas de item -> {out_path}')


if __name__ == '__main__':
    build()
