"""
AC3 – Loja Pokémon | Execução local do notebook Colab
Todos os 10 testes de API: 5 Positivos + 5 Negativos
"""

import requests
import time
import sys

# Tenta importar matplotlib, instala se não tiver
try:
    import matplotlib
    matplotlib.use('Agg')  # modo sem janela
    import matplotlib.pyplot as plt
    PLOT = True
except ImportError:
    PLOT = False

POKEMON_TCG_BASE = 'https://api.pokemontcg.io/v2'
GITHUB_PAGES     = 'https://willzao03.github.io/Loja-Pokemon-projeto/'

VERDE   = '\033[92m'
VERMELHO= '\033[91m'
AMARELO = '\033[93m'
RESET   = '\033[0m'
NEGRITO = '\033[1m'

resultados = []

def log(ok, nome, detalhe=''):
    icone = f'{VERDE}✅ PASSOU{RESET}' if ok else f'{VERMELHO}❌ FALHOU{RESET}'
    print(f'  {icone} | {nome}')
    if detalhe:
        print(f'           ↳ {detalhe}')
    resultados.append({'ok': ok, 'nome': nome, 'detalhe': detalhe})

def get(url, timeout=40):
    try:
        return requests.get(url, timeout=timeout)
    except requests.exceptions.Timeout:
        print(f'           {AMARELO}⚠️  Timeout{RESET}')
        return None
    except Exception as e:
        print(f'           {AMARELO}⚠️  {type(e).__name__}{RESET}')
        return None

def secao(titulo):
    print(f'\n{"─"*60}')
    print(f'  {NEGRITO}{titulo}{RESET}')
    print(f'{"─"*60}')

# ══════════════════════════════════════════════════════════
print(f'\n{"═"*60}')
print(f'  {NEGRITO}AC3 – Loja Pokémon | Testes de API{RESET}')
print(f'  UNIFECAF – Professor Rodrigo Moreira')
print(f'{"═"*60}')

# ══════════════════════════════════════════════════════════
secao('✅ TESTES POSITIVOS')

# POS-01
print(f'\n  {NEGRITO}POS-01{RESET} | Busca válida (Charizard) → status 200 + dados')
url = f'{POKEMON_TCG_BASE}/cards?q=name:Charizard&pageSize=1'
t0 = time.time()
r = get(url)
tempo = time.time() - t0
if r is None:
    log(False, 'POS-01 | Busca Charizard → status 200 + dados', 'Sem resposta da API')
else:
    data = r.json().get('data', [])
    ok = r.status_code == 200 and len(data) > 0
    log(ok, 'POS-01 | Busca Charizard → status 200 + dados',
        f'Status: {r.status_code} | Cartas: {len(data)} | Tempo: {tempo:.2f}s')
    if data:
        c = data[0]
        print(f'           🃏 {c.get("name")} | Set: {c.get("set",{}).get("name","?")} | ID: {c.get("id")}')

# POS-02
print(f'\n  {NEGRITO}POS-02{RESET} | Campos obrigatórios (id, name, images) presentes')
url = f'{POKEMON_TCG_BASE}/cards?q=name:Mewtwo&pageSize=1'
r = get(url)
if r is None:
    log(False, 'POS-02 | Campos obrigatórios (id, name, images)', 'Sem resposta')
else:
    data = r.json().get('data', [])
    card = data[0] if data else {}
    esperados = ['id', 'name', 'images']
    presentes = [f for f in esperados if f in card]
    ausentes  = [f for f in esperados if f not in card]
    ok = len(ausentes) == 0
    log(ok, 'POS-02 | Campos obrigatórios (id, name, images)',
        f'Presentes: {presentes} | Ausentes: {ausentes}')
    if card:
        print(f'           📋 Campos retornados: {list(card.keys())[:8]}')

# POS-03
print(f'\n  {NEGRITO}POS-03{RESET} | Paginação pageSize=3 respeitada')
url = f'{POKEMON_TCG_BASE}/cards?q=name:Pikachu&pageSize=3'
r = get(url)
if r is None:
    log(False, 'POS-03 | Paginação pageSize=3 respeitada', 'Sem resposta')
else:
    data = r.json().get('data', [])
    total_count = r.json().get('totalCount', '?')
    ok = r.status_code == 200 and len(data) <= 3
    log(ok, 'POS-03 | Paginação pageSize=3 respeitada',
        f'Status: {r.status_code} | Retornados: {len(data)} | Total na API: {total_count}')
    for c in data:
        print(f'           • {c.get("name")} [{c.get("id")}]')

# POS-04
print(f'\n  {NEGRITO}POS-04{RESET} | Content-Type é application/json')
url = f'{POKEMON_TCG_BASE}/cards?q=name:Pikachu&pageSize=1'
r = get(url)
if r is None:
    log(False, 'POS-04 | Content-Type é application/json', 'Sem resposta')
else:
    ct = r.headers.get('Content-Type', '')
    ok = 'application/json' in ct
    log(ok, 'POS-04 | Content-Type é application/json', f'Content-Type: {ct}')
    for h in ['X-Ratelimit-Limit', 'X-Ratelimit-Remaining']:
        val = r.headers.get(h, 'não presente')
        print(f'           {h}: {val}')

# POS-05
print(f'\n  {NEGRITO}POS-05{RESET} | Tempo de resposta < 5s (3 medições)')
url = f'{POKEMON_TCG_BASE}/cards?q=name:Blastoise&pageSize=1'
tempos = []
for i in range(3):
    t0 = time.time()
    r = get(url)
    t = time.time() - t0
    tempos.append(t)
    status = r.status_code if r else 'ERR'
    print(f'           Medição {i+1}: {t:.2f}s | Status: {status}')
media = sum(tempos) / len(tempos)
ok = media < 5.0
log(ok, 'POS-05 | Tempo de resposta < 5s',
    f'Média: {media:.2f}s | Min: {min(tempos):.2f}s | Max: {max(tempos):.2f}s')

# ══════════════════════════════════════════════════════════
secao('❌ TESTES NEGATIVOS')

# NEG-01
print(f'\n  {NEGRITO}NEG-01{RESET} | Carta inexistente → data vazio []')
url = f'{POKEMON_TCG_BASE}/cards?q=name:CARTAINEXISTENTE999XYZ'
r = get(url)
if r is None:
    log(False, 'NEG-01 | Carta inexistente → data vazio []', 'Sem resposta')
else:
    data = r.json().get('data', None)
    ok = r.status_code == 200 and isinstance(data, list) and len(data) == 0
    log(ok, 'NEG-01 | Carta inexistente → data vazio []',
        f'Status: {r.status_code} | data: {data} | totalCount: {r.json().get("totalCount","?")}')

# NEG-02
print(f'\n  {NEGRITO}NEG-02{RESET} | Endpoint inválido → 404')
url = f'{POKEMON_TCG_BASE}/rotainexistente'
r = get(url)
if r is None:
    log(False, 'NEG-02 | Endpoint inválido → 404', 'Sem resposta')
else:
    ok = r.status_code == 404
    log(ok, 'NEG-02 | Endpoint inválido → 404', f'Status: {r.status_code}')
    try:
        print(f'           Corpo: {r.json()}')
    except:
        print(f'           Corpo: {r.text[:80]}')

# NEG-03
print(f'\n  {NEGRITO}NEG-03{RESET} | pageSize=0 não deve retornar dados')
url = f'{POKEMON_TCG_BASE}/cards?q=name:Pikachu&pageSize=0'
r = get(url)
if r is None:
    log(False, 'NEG-03 | pageSize=0 não retorna dados', 'Sem resposta')
else:
    data = r.json().get('data', [])
    ok = r.status_code >= 400 or len(data) == 0
    log(ok, 'NEG-03 | pageSize=0 não retorna dados',
        f'Status: {r.status_code} | Itens retornados: {len(data)}')
    if not ok:
        print(f'           {AMARELO}⚠️  Bug da API: ignorou pageSize=0 e retornou {len(data)} itens{RESET}')
        print(f'           Impacto na Loja: nenhum | Recomendação: validar pageSize >= 1')

# NEG-04
print(f'\n  {NEGRITO}NEG-04{RESET} | Filtro por campo inexistente → sem dados')
url = f'{POKEMON_TCG_BASE}/cards?q=campofalso:valorfalso'
r = get(url)
if r is None:
    log(False, 'NEG-04 | Campo inexistente → sem dados', 'Sem resposta')
else:
    data = r.json().get('data', [])
    ok = r.status_code >= 400 or len(data) == 0
    log(ok, 'NEG-04 | Campo inexistente → sem dados',
        f'Status: {r.status_code} | Itens: {len(data)}')

# NEG-05
print(f'\n  {NEGRITO}NEG-05{RESET} | GitHub Pages: disponibilidade do deploy')
print(f'           🔗 {GITHUB_PAGES}')
r = get(GITHUB_PAGES, timeout=15)
if r is None:
    log(False, 'NEG-05 | GitHub Pages INATIVO', 'Sem resposta — ativar em Settings > Pages')
elif r.status_code == 200:
    log(True, 'NEG-05 | GitHub Pages ATIVO (deploy realizado)',
        f'Status: {r.status_code} | Projeto acessível publicamente')
else:
    log(False, 'NEG-05 | GitHub Pages com status inesperado',
        f'Status: {r.status_code}')

# ══════════════════════════════════════════════════════════
passou = sum(1 for r in resultados if r['ok'])
falhou = len(resultados) - passou

print(f'\n{"═"*60}')
print(f'  {NEGRITO}RESULTADO FINAL{RESET}')
print(f'{"═"*60}')
for r in resultados:
    icone = '✅' if r['ok'] else '❌'
    print(f'  {icone} {r["nome"]}')
print(f'{"─"*60}')
print(f'  Passaram : {VERDE}{passou}/{len(resultados)}{RESET}')
print(f'  Falharam : {VERMELHO if falhou else VERDE}{falhou}/{len(resultados)}{RESET}')
print(f'{"═"*60}')

# Análise de falhas
falhas = [r for r in resultados if not r['ok']]
if falhas:
    print(f'\n  {NEGRITO}📋 ANÁLISE DAS FALHAS:{RESET}')
    analises = {
        'POS-01': ('Timeout/instabilidade da API externa', 'Reexecutar em outro momento'),
        'POS-02': ('Timeout/instabilidade da API externa', 'Reexecutar em outro momento'),
        'NEG-03': ('Bug na API: pokemontcg.io ignora pageSize=0', 'Validar pageSize >= 1 no frontend'),
        'NEG-05': ('GitHub Pages não está ativo', 'Ativar em Settings > Pages > Branch: main'),
    }
    for r in falhas:
        codigo = r['nome'].split('|')[0].strip()
        info = analises.get(codigo, ('Falha inesperada', 'Verificar manualmente'))
        print(f'\n  ❌ {r["nome"]}')
        print(f'     Causa  : {info[0]}')
        print(f'     Ação   : {info[1]}')

# Gráfico
if PLOT:
    try:
        fig, axes = plt.subplots(1, 2, figsize=(13, 5))
        fig.patch.set_facecolor('#1a1a2e')

        ax1 = axes[0]
        ax1.set_facecolor('#16213e')
        vals = [passou, falhou] if falhou > 0 else [passou]
        labs = [f'Passou ({passou})', f'Falhou ({falhou})'] if falhou > 0 else [f'Passou ({passou})']
        cs   = ['#00e676', '#e3350d'] if falhou > 0 else ['#00e676']
        wedges, texts, autotexts = ax1.pie(vals, labels=labs, colors=cs,
            autopct='%1.0f%%', startangle=90,
            textprops={'color': 'white', 'fontsize': 12})
        for at in autotexts:
            at.set_color('white')
            at.set_fontsize(13)
        ax1.set_title('Resultado Geral', color='#ffcb05', fontsize=14, pad=15)

        ax2 = axes[1]
        ax2.set_facecolor('#16213e')
        nomes     = [r['nome'].split('|')[0].strip() for r in resultados]
        cores_bar = ['#00e676' if r['ok'] else '#e3350d' for r in resultados]
        ax2.barh(nomes, [1]*len(resultados), color=cores_bar, edgecolor='#0f3460')
        ax2.set_xlim(0, 1.4)
        ax2.set_xticks([])
        for i, r in enumerate(resultados):
            ax2.text(1.05, i, '✅ PASSOU' if r['ok'] else '❌ FALHOU',
                     va='center', color='white', fontsize=9)
        ax2.tick_params(colors='white')
        for spine in ax2.spines.values():
            spine.set_edgecolor('#0f3460')
        ax2.set_title('Resultado por Teste', color='#ffcb05', fontsize=14, pad=15)
        plt.setp(ax2.get_yticklabels(), color='white', fontsize=9)

        plt.suptitle('AC3 – Loja Pokémon | Testes de API',
                     color='#ffcb05', fontsize=15, fontweight='bold', y=1.02)
        plt.tight_layout()
        plt.savefig('testes/resultado_testes.png', dpi=150,
                    bbox_inches='tight', facecolor='#1a1a2e')
        print(f'\n  📊 Gráfico salvo em: testes/resultado_testes.png')
    except Exception as e:
        print(f'\n  ⚠️  Gráfico não gerado: {e}')
else:
    print('\n  ⚠️  matplotlib não disponível — gráfico não gerado')
    print('     Execute: pip install matplotlib')
