import argparse
import os
from PIL import Image

# ================= CONFIGURAÇÕES =================
ROOT = os.path.dirname(os.path.abspath(__file__))
DIRETORIO = os.path.join(ROOT, 'template', 'images', 'skills')

# Ícones 64x64 cujo conteúdo NÃO está no padrão (2,2,36,36) — tratados manualmente
EXCLUDED = {'Recover Totem.png', 'Recover Totem_G.png'}

CROP_BOX = (2, 2, 36, 36)  # produz 34x34
# ===================================================


def processar(diretorio, aplicar):
    cropados = 0
    ja_corretos = 0
    ignorados = 0
    inesperados = []

    for nome in sorted(os.listdir(diretorio)):
        if not nome.lower().endswith('.png'):
            continue

        caminho = os.path.join(diretorio, nome)

        if nome in EXCLUDED:
            ignorados += 1
            continue

        with Image.open(caminho) as img:
            img = img.convert('RGBA')

            if img.size == (34, 34):
                ja_corretos += 1
                continue

            if img.size != (64, 64):
                inesperados.append((nome, img.size, None))
                continue

            bbox = img.getbbox()
            if bbox != CROP_BOX:
                inesperados.append((nome, img.size, bbox))
                continue

            if aplicar:
                cropado = img.crop(CROP_BOX)
                cropado.save(caminho, 'PNG')

            cropados += 1

    print("\n================ RESUMO ================")
    print(f" Já 34x34 (sem alteração): {ja_corretos}")
    print(f" 64x64 -> cropados para 34x34: {cropados}")
    print(f" Ignorados (tratamento manual): {ignorados}")
    print(f" Inesperados (não tocados): {len(inesperados)}")
    for nome, size, bbox in inesperados:
        print(f"   - {nome}: size={size} bbox={bbox}")
    if not aplicar:
        print("\n[DRY-RUN] Nenhum arquivo foi modificado. Rode com --apply para gravar.")
    print("=========================================")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Crop de ícones de skill 64x64 (borda transparente) para 34x34.')
    parser.add_argument('--apply', action='store_true', help='Grava as alterações (sem isso, apenas simula).')
    args = parser.parse_args()
    processar(DIRETORIO, args.apply)
