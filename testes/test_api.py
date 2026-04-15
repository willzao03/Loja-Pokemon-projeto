"""
AC3 – Loja Pokémon
Testes automatizados: API Pokémon TCG + disponibilidade Google Cloud / GitHub Pages
Grupo: Vinnicius, Matheus, Willian, Gabriel – UNIFECAF

Instalação:
    pip install requests

Execução:
    python test_api.py
"""

import requests

POKEMON_TCG_BASE = "https://api.pokemontcg.io/v2"
GITHUB_PAGES_URL = "https://willzao03.github.io/Loja-Pokemon-projeto/"
GITHUB_REPO_URL  = "https://github.com/willzao03/Loja-Pokemon-projeto"

PASS = "\033[92m[PASSOU]\033[0m"
FAIL = "\033[91m[FALHOU]\033[0m"
INFO = "\033[94m[INFO]\033[0m"

resultados = []

def log(status, nome, detalhe=""):
    simbolo = PASS if status else FAIL
    print(f"{simbolo} {nome}")
    if detalhe:
        print(f"         {detalhe}")
    resultados.append((status, nome))

# ─────────────────────────────────────────────
# CT-08 – API TCG: busca válida (Charizard)
# ─────────────────────────────────────────────
def test_api_busca_valida_charizard():
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Charizard&pageSize=1"
    r = requests.get(url, timeout=10)
    ok = r.status_code == 200 and len(r.json().get("data", [])) > 0
    log(ok, "CT-08 | API TCG – Busca válida (Charizard)",
        f"Status: {r.status_code} | Cartas retornadas: {len(r.json().get('data', []))}")

# ─────────────────────────────────────────────
# CT-08b – API TCG: busca válida (Pikachu)
# ─────────────────────────────────────────────
def test_api_busca_valida_pikachu():
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Pikachu&pageSize=3"
    r = requests.get(url, timeout=10)
    ok = r.status_code == 200 and len(r.json().get("data", [])) > 0
    log(ok, "CT-08b | API TCG – Busca válida (Pikachu)",
        f"Status: {r.status_code} | Cartas retornadas: {len(r.json().get('data', []))}")

# ─────────────────────────────────────────────
# CT-09 – API TCG: carta inexistente (data vazio)
# ─────────────────────────────────────────────
def test_api_carta_inexistente():
    url = f"{POKEMON_TCG_BASE}/cards?q=name:CARTAINEXISTENTE999XYZ"
    r = requests.get(url, timeout=10)
    data = r.json().get("data", None)
    ok = r.status_code == 200 and isinstance(data, list) and len(data) == 0
    log(ok, "CT-09 | API TCG – Carta inexistente (data vazio)",
        f"Status: {r.status_code} | data: {data}")

# ─────────────────────────────────────────────
# CT-09b – API TCG: endpoint inválido (404)
# ─────────────────────────────────────────────
def test_api_endpoint_invalido():
    url = f"{POKEMON_TCG_BASE}/cartasinvalidas"
    r = requests.get(url, timeout=10)
    ok = r.status_code == 404
    log(ok, "CT-09b | API TCG – Endpoint inválido (404)",
        f"Status: {r.status_code}")

# ─────────────────────────────────────────────
# CT-10 – GitHub Pages (Google Cloud / deploy)
# ─────────────────────────────────────────────
def test_github_pages_disponibilidade():
    try:
        r = requests.get(GITHUB_PAGES_URL, timeout=10)
        ok = r.status_code == 200
        log(ok, "CT-10 | GitHub Pages – Disponibilidade",
            f"Status: {r.status_code} | URL: {GITHUB_PAGES_URL}")
    except requests.exceptions.ConnectionError:
        log(False, "CT-10 | GitHub Pages – Disponibilidade",
            "ERRO: GitHub Pages não está ativado. Ativar em Settings > Pages > Branch: main")

# ─────────────────────────────────────────────
# CT-10b – Repositório GitHub acessível
# ─────────────────────────────────────────────
def test_github_repo_acessivel():
    r = requests.get(GITHUB_REPO_URL, timeout=10)
    ok = r.status_code == 200
    log(ok, "CT-10b | GitHub – Repositório público acessível",
        f"Status: {r.status_code} | URL: {GITHUB_REPO_URL}")

# ─────────────────────────────────────────────
# CT-11 – API TCG: validar campos retornados
# ─────────────────────────────────────────────
def test_api_campos_retornados():
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Mewtwo&pageSize=1"
    r = requests.get(url, timeout=10)
    data = r.json().get("data", [])
    if data:
        card = data[0]
        campos = ["id", "name", "images"]
        ok = all(c in card for c in campos)
        log(ok, "CT-11 | API TCG – Campos obrigatórios presentes (id, name, images)",
            f"Campos encontrados: {list(card.keys())[:6]}")
    else:
        log(False, "CT-11 | API TCG – Campos obrigatórios", "Nenhuma carta retornada")

# ─────────────────────────────────────────────
# CT-12 – API TCG: tempo de resposta < 5s
# ─────────────────────────────────────────────
def test_api_tempo_resposta():
    import time
    url = f"{POKEMON_TCG_BASE}/cards?q=name:Blastoise&pageSize=1"
    inicio = time.time()
    r = requests.get(url, timeout=10)
    elapsed = time.time() - inicio
    ok = elapsed < 5.0
    log(ok, "CT-12 | API TCG – Tempo de resposta < 5s",
        f"Tempo: {elapsed:.2f}s | Status: {r.status_code}")

# ─────────────────────────────────────────────
# RESUMO
# ─────────────────────────────────────────────
def resumo():
    total   = len(resultados)
    passou  = sum(1 for r in resultados if r[0])
    falhou  = total - passou
    print("\n" + "="*50)
    print(f"  RESULTADO FINAL: {passou}/{total} testes passaram")
    if falhou:
        print(f"  {FAIL} {falhou} teste(s) falharam")
    else:
        print(f"  {PASS} Todos os testes passaram!")
    print("="*50)

if __name__ == "__main__":
    print("\n" + "="*50)
    print("  AC3 – Loja Pokémon | Testes Automatizados")
    print("  UNIFECAF – Professor Rodrigo Moreira")
    print("="*50 + "\n")

    test_api_busca_valida_charizard()
    test_api_busca_valida_pikachu()
    test_api_carta_inexistente()
    test_api_endpoint_invalido()
    test_github_pages_disponibilidade()
    test_github_repo_acessivel()
    test_api_campos_retornados()
    test_api_tempo_resposta()

    resumo()
