import argparse
import os
import csv
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_DESTINO_PADRAO = os.path.join(ROOT, 'template', 'images', 'skills')


def carregar_nomes_icones(csv_path):
    """Lê o CSV e extrai todos os nomes únicos da coluna Image_Icon"""
    icones = set()

    if not os.path.exists(csv_path):
        print(f"[-] Erro: O arquivo CSV não foi encontrado em: {csv_path}")
        return icones

    with open(csv_path, mode='r', encoding='utf-8-sig') as f:
        # Detecta automaticamente o separador (vírgula ou ponto e vírgula)
        try:
            dialeto = csv.Sniffer().sniff(f.read(2048))
            f.seek(0)
            leitor = csv.DictReader(f, dialect=dialeto)
        except csv.Error:
            leitor = None

        # Se o sniff falhou ou "adivinhou" um delimitador errado (comum em CSVs
        # de uma coluna só), cai para o dialeto padrão (vírgula)
        if leitor is None or 'Image_Icon' not in leitor.fieldnames:
            f.seek(0)
            leitor = csv.DictReader(f)

        # Verifica se a coluna realmente existe
        if 'Image_Icon' not in leitor.fieldnames:
            print(f"[-] Erro: A coluna 'Image_Icon' não foi encontrada no CSV.")
            print(f"Colunas detectadas: {leitor.fieldnames}")
            return icones

        for linha in leitor:
            nome_icone = linha['Image_Icon']
            if nome_icone:  # Ignora linhas vazias
                # Remove espaços em branco nas pontas
                nome_icone = nome_icone.strip()
                icones.add(nome_icone)

    return icones


def mapear_diretorio_origem(diretorio):
    """Mapeia todos os arquivos do diretório de origem (e subdiretórios)
    Criando um dicionário indexado pelo nome do arquivo em minúsculo para busca rápida e case-insensitive."""
    mapa_arquivos = {}
    print("[+] Mapeando arquivos do jogo (isso pode levar alguns segundos)...")

    for raiz, _, arquivos in os.walk(diretorio):
        for arquivo in arquivos:
            # Salva o caminho completo associado ao nome do arquivo em minúsculo
            mapa_arquivos[arquivo.lower()] = os.path.join(raiz, arquivo)

    return mapa_arquivos


def converter_dds_para_png(csv_path, diretorio_origem, diretorio_destino):
    # Cria a pasta de destino se ela não existir
    if not os.path.exists(diretorio_destino):
        os.makedirs(diretorio_destino)
        print(f"[+] Diretório de destino criado: {diretorio_destino}")

    # 1. Carrega os ícones que precisamos buscar vindos do CSV
    icones_desejados = carregar_nomes_icones(csv_path)
    if not icones_desejados:
        print("[-] Nenhum ícone foi extraído do CSV. Encerrando.")
        return

    print(f"[+] Encontrados {len(icones_desejados)} ícones únicos listados no CSV.")

    # 2. Mapeia os arquivos físicos existentes no diretório do jogo
    arquivos_do_jogo = mapear_diretorio_origem(diretorio_origem)

    # Contadores para o resumo final
    sucessos = 0
    falhas = 0
    nao_encontrados = 0

    # 3. Processa cada ícone
    for icone in icones_desejados:
        # Força a extensão .dds caso o CSV traga apenas o nome limpo ou outra extensão
        nome_base, _ = os.path.splitext(icone)
        nome_arquivo_dds = f"{nome_base}.dds"
        nome_arquivo_png = f"{nome_base}.png"

        # Busca case-insensitive no dicionário mapeado
        if nome_arquivo_dds.lower() in arquivos_do_jogo:
            caminho_completo_dds = arquivos_do_jogo[nome_arquivo_dds.lower()]
            caminho_completo_png = os.path.join(diretorio_destino, nome_arquivo_png)

            try:
                # Abre a imagem DDS e converte para PNG
                with Image.open(caminho_completo_dds) as img:
                    # Garante que imagens com transparência (RGBA) continuem perfeitas
                    img.save(caminho_completo_png, 'PNG')
                print(f"[OK] Convertido: {nome_arquivo_dds} -> {nome_arquivo_png}")
                sucessos += 1
            except Exception as e:
                print(f"[-] Erro ao converter {nome_arquivo_dds}: {e}")
                falhas += 1
        else:
            print(f"[?] Arquivo não encontrado no diretório: {nome_arquivo_dds}")
            nao_encontrados += 1

    # Resumo final no terminal
    print("\n================ RESUMO FILTRADO ================")
    print(f" Total de itens únicos no CSV: {len(icones_desejados)}")
    print(f" Convertidos com sucesso: {sucessos}")
    print(f" Arquivos não localizados: {nao_encontrados}")
    print(f" Falhas na conversão: {falhas}")
    print("=================================================")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Converte ícones .dds do jogo para .png a partir de uma lista de nomes em CSV.')
    parser.add_argument('csv', help='CSV com a coluna Image_Icon (ex: TEMP_Ajuste/icons_needed_<Classe>.csv)')
    parser.add_argument('--origem', required=True,
                         help='Diretório de origem com os arquivos .dds extraídos do jogo (ex: pasta UI do client)')
    parser.add_argument('--destino', default=DIRETORIO_DESTINO_PADRAO,
                         help=f'Diretório de destino para os .png convertidos (padrão: {DIRETORIO_DESTINO_PADRAO})')
    args = parser.parse_args()
    converter_dds_para_png(args.csv, args.origem, args.destino)
