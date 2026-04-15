# Como executar os testes – AC3 Loja Pokémon

## Testes Python (API + Google Cloud)

```bash
# Instalar dependência
pip install requests

# Executar
python test_api.py
```

## Testes Playwright (Sistema front-end)

```bash
# Instalar dependências
npm install

# Instalar browser
npx playwright install chromium

# Executar
npx playwright test test_sistema.js --reporter=list
```

## O que cada arquivo testa

| Arquivo | O que testa |
|---|---|
| `test_api.py` | API Pokémon TCG, GitHub Pages, tempo de resposta |
| `test_sistema.js` | Login, cadastro, carrinho, busca, filtros, admin |
