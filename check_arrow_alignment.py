import argparse
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

ASSET_BBOX = {
    1: (0, 0, 59, 17),
    2: (0, 0, 13, 17),
    3: (1, 0, 16, 16),
    4: (0, 0, 17, 59),
    5: (0, 0, 17, 13),
    6: (0, 0, 15, 16),
    7: (0, 0, 13, 17),
    9: (0, 0, 17, 107),
    10: (0, 0, 17, 75),
}

THRESHOLD = 2  # px

parser = argparse.ArgumentParser(
    description='Verifica o alinhamento das setas do calculator contra os ícones conectados.')
parser.add_argument('grid_dump', help='JSON com as bounding boxes dos ícones/setas (gerado via Playwright)')
args = parser.parse_args()

data = json.load(open(os.path.join(ROOT, 'template', 'js', 'skills_data.json')))
dump = json.load(open(args.grid_dump))

for cls, skills in data.items():
    if cls not in dump:
        continue
    icons = {i['id']: i for i in dump[cls]['icons']}
    arrows = {a['id']: a for a in dump[cls]['arrows']}

    for s in skills:
        req = s.get('requirement')
        if not isinstance(req, list) or len(req) < 3:
            continue
        prereq_id, arrow_id, atype = str(req[0]), req[1], req[2]

        self_icon = icons.get(str(s['id']))
        prereq_icon = icons.get(prereq_id)
        arrow = arrows.get(arrow_id)
        if not self_icon or not prereq_icon or not arrow:
            print(f"class {cls}: skill {s['id']} -> missing data (icon/arrow) for {req}")
            continue

        bx0, by0, bx1, by1 = ASSET_BBOX[atype]
        vis_left = arrow['x'] + bx0
        vis_top = arrow['y'] + by0

        dx = self_icon['x'] - prereq_icon['x']
        dy = self_icon['y'] - prereq_icon['y']

        if dx == 0 and dy != 0:
            icon_cx = prereq_icon['x'] + prereq_icon['w'] / 2
            exp_left = icon_cx - (bx0 + bx1) / 2
            if dy > 0:  # self below prereq
                exp_top = prereq_icon['y'] + prereq_icon['h']
            else:  # self above prereq
                exp_top = prereq_icon['y'] - (by1 - by0)
        elif dy == 0 and dx != 0:
            icon_cy = prereq_icon['y'] + prereq_icon['h'] / 2
            exp_top = icon_cy - (by0 + by1) / 2
            if dx > 0:  # self to the right
                exp_left = prereq_icon['x'] + prereq_icon['w']
            else:
                exp_left = prereq_icon['x'] - (bx1 - bx0)
        else:
            print(f"class {cls}: skill {s['id']} arrow {arrow_id} type {atype} -> DIAGONAL (dx={dx},dy={dy}), check manually")
            continue

        delta_top = exp_top - vis_top
        delta_left = exp_left - vis_left

        if abs(delta_top) > THRESHOLD or abs(delta_left) > THRESHOLD:
            new_top = arrow['y'] + delta_top
            new_left = arrow['x'] + delta_left
            print(f"class {cls}: skill {s['id']} arrow {arrow_id} (type{atype}) -> "
                  f"current top:{arrow['y']}px left:{arrow['x']}px | "
                  f"suggested top:{round(new_top)}px left:{round(new_left)}px "
                  f"(delta_top={delta_top:.1f}, delta_left={delta_left:.1f})")
