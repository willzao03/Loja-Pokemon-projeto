"""
AC3 – Loja Pokémon
Testes automatizados: API Pokémon TCG
Grupo: Vinnicius, Matheus, Willian, Gabriel – UNIFECAF

Instalação:
    pip install requests

Execução:
    python test_api.py
"""

import requests
import time

POKEMON_TCG_BASE = "https://api.pokemontcg.io/v2"
GITHUB_PAGES_URL = "https://willzao03.github.io/Loja-Pokemon-projeto/"
GITHUB_REPO_URL  = "https://github.com/willzao03/Loja-Pokemon-projeto"

PASS = "\033[92m[PASSOU]\033[0m"
FAIL = "\033[91m[FALHOU]\033[0m"

resultados = []

def log(status, nome, detalhe=""):
    simbolo = PASS if status else FAIL
    print(f"{simbolo} {nome}")
    if detalhe:
        print(f"         {detalhe}")
    resultados.append((status, nome))

def safe_get(url, timeout=20):
    """Wrapper com tratamento de timeout e erros de conexão"""
    try:
        return requests.get(url, timeout=timeout)
    except requests.exceptions.Timeout:
        print(f"         \033[93m[AVISO]\033[0m Timeout ao acessar {url}")
        return None
    except requests.exceptions.ConnectionError:
        print(f"         \033[93m[AVISO]\033[0m Sem conexão para {url}")
        return None

# ══════════════════════════════════════════════
#  TESTES POSITIVOS (espera-se PASSOU)
# ══════════════════════════════════════════════

def test_pos_01_busca_charizard():
    """Busca válida retorna cartas e status 200"""
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Charizard&pageSize=1"
    r = safe_get(url)
    if r is None: log(False, "POS-01 | Busca válida (Charizard) retorna status 200 e dados", "Timeout/sem conexão"); return
    ok = r.status_code == 200 and len(r.json().get("data", [])) > 0
    log(ok, "POS-01 | Busca válida (Charizard) retorna status 200 e dados",
        f"Status: {r.status_code} | Cartas: {len(r.json().get('data', []))}")

def test_pos_02_campos_obrigatorios():
    """Carta retornada contém campos id, name e images"""
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Mewtwo&pageSize=1"
    r = safe_get(url)
    if r is None: log(False, "POS-02 | Campos obrigatórios (id, name, images) presentes", "Timeout/sem conexão"); return
    data = r.json().get("data", [])
    card = data[0] if data else {}
    ok = all(c in card for c in ["id", "name", "images"])
    log(ok, "POS-02 | Campos obrigatórios (id, name, images) presentes",
        f"Campos: {list(card.keys())[:6]}")

def test_pos_03_paginacao():
    """pageSize=3 retorna no máximo 3 itens"""
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Pikachu&pageSize=3"
    r = safe_get(url)
    if r is None: log(False, "POS-03 | Paginação pageSize=3 respeitada", "Timeout/sem conexão"); return
    data = r.json().get("data", [])
    ok = r.status_code == 200 and len(data) <= 3
    log(ok, "POS-03 | Paginação pageSize=3 respeitada",
        f"Status: {r.status_code} | Itens retornados: {len(data)}")

def test_pos_04_content_type_json():
    """Resposta da API tem Content-Type application/json"""
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Pikachu&pageSize=1"
    r = safe_get(url)
    if r is None: log(False, "POS-04 | Content-Type é application/json", "Timeout/sem conexão"); return
    ct = r.headers.get("Content-Type", "")
    ok = "application/json" in ct
    log(ok, "POS-04 | Content-Type é application/json",
        f"Content-Type: {ct}")

def test_pos_05_tempo_resposta():
    """Tempo de resposta da API menor que 5 segundos"""
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Blastoise&pageSize=1"
    inicio = time.time()
    r = safe_get(url)
    elapsed = time.time() - inicio
    if r is None: log(False, "POS-05 | Tempo de resposta < 5s", "Timeout/sem conexão"); return
    ok = elapsed < 5.0
    log(ok, "POS-05 | Tempo de resposta < 5s",
        f"Tempo: {elapsed:.2f}s | Status: {r.status_code}")

# ══════════════════════════════════════════════
#  TESTES NEGATIVOS (espera-se comportamento de erro/vazio)
# ══════════════════════════════════════════════

def test_neg_01_carta_inexistente():
    """Busca por carta inexistente retorna lista vazia (não erro)"""
    url = f"{POKEMON_TCG_BASE}/cards?q=name:CARTAINEXISTENTE999XYZ"
    r = safe_get(url)
    if r is None: log(False, "NEG-01 | Carta inexistente retorna data vazio []", "Timeout/sem conexão"); return
    data = r.json().get("data", None)
    ok = r.status_code == 200 and isinstance(data, list) and len(data) == 0
    log(ok, "NEG-01 | Carta inexistente retorna data vazio []",
        f"Status: {r.status_code} | data: {data}")

def test_neg_02_endpoint_invalido():
    """Endpoint inexistente retorna 404"""
    url = f"{POKEMON_TCG_BASE}/rotainexistente"
    r = safe_get(url)
    if r is None: log(False, "NEG-02 | Endpoint inválido retorna 404", "Timeout/sem conexão"); return
    ok = r.status_code == 404
    log(ok, "NEG-02 | Endpoint inválido retorna 404",
        f"Status: {r.status_code}")

def test_neg_03_pagina_zero():
    """pageSize=0 retorna erro ou lista vazia"""
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Pikachu&pageSize=0"
    r = safe_get(url)
    if r is None: log(False, "NEG-03 | pageSize=0 não retorna dados válidos", "Timeout/sem conexão"); return
    data = r.json().get("data", [])
    ok = r.status_code >= 400 or len(data) == 0
    log(ok, "NEG-03 | pageSize=0 não retorna dados válidos",
        f"Status: {r.status_code} | Itens: {len(data)}")

def test_neg_04_campo_inexistente_no_filtro():
    """Filtro por campo inexistente retorna erro ou lista vazia"""
    url = f"{POKEMON_TCG_BASE}/cards?q=campofalso:valorfalso"
    r = safe_get(url)
    if r is None: log(False, "NEG-04 | Filtro por campo inexistente não retorna dados", "Timeout/sem conexão"); return
    data = r.json().get("data", [])
    ok = r.status_code >= 400 or len(data) == 0
    log(ok, "NEG-04 | Filtro por campo inexistente não retorna dados",
        f"Status: {r.status_code} | Itens: {len(data)}")

def test_neg_05_github_pages_indisponivel():
    """GitHub Pages do projeto — registra disponibilidade real"""
    r = safe_get(GITHUB_PAGES_URL)
    if r is None:
        log(False, "NEG-05 | GitHub Pages INATIVO (sem deploy ou timeout)",
            "Ativar em Settings > Pages > Branch: main")
        return
    if r.status_code == 200:
        log(True, "NEG-05 | GitHub Pages está ATIVO (deploy realizado)",
            f"Status: {r.status_code} | URL: {GITHUB_PAGES_URL}")
    else:
        log(False, "NEG-05 | GitHub Pages retornou status inesperado",
            f"Status: {r.status_code} — Ativar em Settings > Pages > Branch: main")

# ══════════════════════════════════════════════
#  RESUMO
# ══════════════════════════════════════════════

def resumo():
    total  = len(resultados)
    passou = sum(1 for r in resultados if r[0])
    falhou = total - passou
    print("\n" + "="*55)
    print(f"  RESULTADO FINAL: {passou}/{total} testes passaram")
    if falhou:
        print(f"  \033[91m[FALHOU]\033[0m {falhou} teste(s) com resultado inesperado")
    else:
        print(f"  \033[92m[PASSOU]\033[0m Todos os testes passaram!")
    print("="*55)

if __name__ == "__main__":
    print("\n" + "="*55)
    print("  AC3 – Loja Pokémon | Testes de API")
    print("  UNIFECAF – Professor Rodrigo Moreira")
    print("="*55)
    print("\n── TESTES POSITIVOS ──────────────────────────────\n")
    test_pos_01_busca_charizard()
    test_pos_02_campos_obrigatorios()
    test_pos_03_paginacao()
    test_pos_04_content_type_json()
    test_pos_05_tempo_resposta()
    print("\n── TESTES NEGATIVOS ──────────────────────────────\n")
    test_neg_01_carta_inexistente()
    test_neg_02_endpoint_invalido()
    test_neg_03_pagina_zero()
    test_neg_04_campo_inexistente_no_filtro()
    test_neg_05_github_pages_indisponivel()
    resumo()
