# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_sistema.js >> CT-12 | Filtro por tipo exibe apenas cartas do tipo selecionado
- Location: test_sistema.js:161:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('.type-badge').nth(3)
Expected: "Fogo"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('.type-badge').nth(3)
    9 × locator resolved to <span id="modal-type" class="type-badge"></span>
      - unexpected value ""

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - link "Pokébola Loja Pokémon" [ref=e3] [cursor=pointer]:
      - /url: index.html
      - img "Pokébola" [ref=e4]
      - generic [ref=e5]: Loja Pokémon
    - navigation [ref=e6]:
      - link "Início" [ref=e7] [cursor=pointer]:
        - /url: index.html
      - link "Admin" [ref=e8] [cursor=pointer]:
        - /url: admin.html
      - link "🛒" [ref=e9] [cursor=pointer]:
        - /url: "#"
      - link "Login" [ref=e10] [cursor=pointer]:
        - /url: login.html
  - generic [ref=e11]:
    - heading "Compre e venda cartas Pokémon" [level=1] [ref=e12]
    - paragraph [ref=e13]: As melhores cartas colecionáveis em um só lugar
    - generic [ref=e14]:
      - textbox "Buscar carta por nome ou tipo..." [ref=e15]
      - button "Buscar" [ref=e16] [cursor=pointer]
  - generic [ref=e17]:
    - generic [ref=e18]:
      - button "Todos" [ref=e19] [cursor=pointer]
      - button "Elétrico" [ref=e20] [cursor=pointer]
      - button "Fantasma" [ref=e21] [cursor=pointer]
      - button "Fogo" [active] [ref=e22] [cursor=pointer]
      - button "Gelo" [ref=e23] [cursor=pointer]
      - button "Lutador" [ref=e24] [cursor=pointer]
      - button "Normal" [ref=e25] [cursor=pointer]
      - button "Planta" [ref=e26] [cursor=pointer]
      - button "Psíquico" [ref=e27] [cursor=pointer]
      - button "Veneno" [ref=e28] [cursor=pointer]
      - button "Água" [ref=e29] [cursor=pointer]
    - combobox [ref=e30] [cursor=pointer]:
      - option "Nome A-Z" [selected]
      - option "Menor preço"
      - option "Maior preço"
  - heading "Cartas Disponíveis" [level=2] [ref=e31]
  - generic [ref=e32]:
    - generic [ref=e33] [cursor=pointer]:
      - img "Charizard" [ref=e34]
      - generic [ref=e35]:
        - generic [ref=e36]: Fogo
        - heading "Charizard" [level=3] [ref=e37]
        - paragraph [ref=e38]: R$ 250.00
        - button "🛒 Adicionar" [ref=e39]
    - generic [ref=e40] [cursor=pointer]:
      - img "Moltres" [ref=e41]
      - generic [ref=e42]:
        - generic [ref=e43]: Fogo
        - heading "Moltres" [level=3] [ref=e44]
        - paragraph [ref=e45]: R$ 270.00
        - button "🛒 Adicionar" [ref=e46]
    - generic [ref=e47] [cursor=pointer]:
      - img "Ninetales" [ref=e48]
      - generic [ref=e49]:
        - generic [ref=e50]: Fogo
        - heading "Ninetales" [level=3] [ref=e51]
        - paragraph [ref=e52]: R$ 130.00
        - button "🛒 Adicionar" [ref=e53]
  - contentinfo [ref=e54]:
    - paragraph [ref=e55]: Loja Pokémon © 2025 — UNIFECAF | Projeto de E-commerce
```

# Test source

```ts
  73  | 
  74  | // ─────────────────────────────────────────────
  75  | // CT-06 – Adicionar carta ao carrinho
  76  | // ─────────────────────────────────────────────
  77  | test('CT-06 | Adicionar carta ao carrinho atualiza badge', async ({ page }) => {
  78  |   await page.goto(BASE);
  79  |   await page.locator('.btn-buy').first().click();
  80  |   const badge = page.locator('#cart-badge');
  81  |   await expect(badge).toBeVisible();
  82  |   const text = await badge.textContent();
  83  |   expect(parseInt(text)).toBeGreaterThanOrEqual(1);
  84  | });
  85  | 
  86  | // ─────────────────────────────────────────────
  87  | // CT-07 – Login com campos vazios bloqueado
  88  | // ─────────────────────────────────────────────
  89  | test('CT-07 | Login com campos vazios é bloqueado pelo HTML', async ({ page }) => {
  90  |   await page.goto(LOGIN_URL);
  91  |   await page.click('button[type="submit"]');
  92  |   // campo required impede submit — URL não muda
  93  |   expect(page.url()).toContain('login.html');
  94  | });
  95  | 
  96  | // ─────────────────────────────────────────────
  97  | // CT-08 – Cadastro e login completo
  98  | // ─────────────────────────────────────────────
  99  | test('CT-08 | Cadastro de novo usuário e login', async ({ page }) => {
  100 |   await page.goto(LOGIN_URL);
  101 |   // ir para cadastro
  102 |   await page.click('#link-cadastro');
  103 |   const user = 'testuser_' + Date.now();
  104 |   await page.fill('#cad-user', user);
  105 |   await page.fill('#cad-pass', 'senha123');
  106 |   await page.click('#form-cadastro button[type="submit"]');
  107 |   await expect(page.locator('#msg-cadastro')).toContainText('Cadastro realizado');
  108 | 
  109 |   // fazer login
  110 |   await page.fill('#login-user', user);
  111 |   await page.fill('#login-pass', 'senha123');
  112 |   await page.click('#form-login button[type="submit"]');
  113 |   await expect(page).toHaveURL(/index\.html/);
  114 | });
  115 | 
  116 | // ─────────────────────────────────────────────
  117 | // CT-09 – Login com senha errada
  118 | // ─────────────────────────────────────────────
  119 | test('CT-09 | Login com senha errada exibe erro', async ({ page }) => {
  120 |   await page.goto(LOGIN_URL);
  121 |   // cadastrar usuário primeiro
  122 |   await page.click('#link-cadastro');
  123 |   const user = 'errouser_' + Date.now();
  124 |   await page.fill('#cad-user', user);
  125 |   await page.fill('#cad-pass', 'correta');
  126 |   await page.click('#form-cadastro button[type="submit"]');
  127 | 
  128 |   // tentar login com senha errada
  129 |   await page.fill('#login-user', user);
  130 |   await page.fill('#login-pass', 'errada');
  131 |   await page.click('#form-login button[type="submit"]');
  132 |   await expect(page.locator('#msg-login')).toContainText('incorretos');
  133 | });
  134 | 
  135 | // ─────────────────────────────────────────────
  136 | // CT-10 – Admin: preço negativo bloqueado
  137 | // ─────────────────────────────────────────────
  138 | test('CT-10 | Admin: inserção com preço negativo exibe erro', async ({ page }) => {
  139 |   await page.goto(ADMIN_URL);
  140 |   await page.fill('#card-name', 'CartaTeste');
  141 |   await page.fill('#card-type', 'Fogo');
  142 |   await page.fill('#card-price', '-50');
  143 |   await page.fill('#card-stock', '1');
  144 |   await page.click('#form-insert button[type="submit"]');
  145 |   await expect(page.locator('#msg-insert')).toContainText('inválido');
  146 | });
  147 | 
  148 | // ─────────────────────────────────────────────
  149 | // CT-11 – Admin: excluir carta inexistente
  150 | // ─────────────────────────────────────────────
  151 | test('CT-11 | Admin: excluir carta inexistente exibe erro', async ({ page }) => {
  152 |   await page.goto(ADMIN_URL);
  153 |   await page.fill('#delete-name', 'CartaQueNaoExiste999');
  154 |   await page.click('#form-delete button[type="submit"]');
  155 |   await expect(page.locator('#msg-delete')).toContainText('não encontrada');
  156 | });
  157 | 
  158 | // ─────────────────────────────────────────────
  159 | // CT-12 – Filtro por tipo funciona
  160 | // ─────────────────────────────────────────────
  161 | test('CT-12 | Filtro por tipo exibe apenas cartas do tipo selecionado', async ({ page }) => {
  162 |   await page.goto(BASE);
  163 |   // clicar no filtro Fogo
  164 |   const fogoBtn = page.locator('.type-btn', { hasText: 'Fogo' });
  165 |   await fogoBtn.click();
  166 |   const cards = page.locator('.card');
  167 |   const count = await cards.count();
  168 |   expect(count).toBeGreaterThan(0);
  169 |   // todas as cartas visíveis devem ter badge Fogo
  170 |   const badges = page.locator('.type-badge');
  171 |   const total = await badges.count();
  172 |   for (let i = 0; i < total; i++) {
> 173 |     await expect(badges.nth(i)).toHaveText('Fogo');
      |                                 ^ Error: expect(locator).toHaveText(expected) failed
  174 |   }
  175 | });
  176 | 
```