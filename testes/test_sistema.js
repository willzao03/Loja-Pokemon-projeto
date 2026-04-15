/**
 * AC3 – Loja Pokémon
 * Testes automatizados do sistema front-end via Playwright
 * Grupo: Vinnicius, Matheus, Willian, Gabriel – UNIFECAF
 *
 * Instalação:
 *   npm init -y
 *   npm install @playwright/test
 *   npx playwright install chromium
 *
 * Execução:
 *   npx playwright test test_sistema.js --reporter=list
 */

const { test, expect } = require('@playwright/test');

const BASE = 'file://' + __dirname.replace(/\\/g, '/').replace('/testes', '') + '/index.html';
const LOGIN_URL  = BASE.replace('index.html', 'login.html');
const ADMIN_URL  = BASE.replace('index.html', 'admin.html');

// ─────────────────────────────────────────────
// CT-01 – Página inicial carrega cartas
// ─────────────────────────────────────────────
test('CT-01 | index.html carrega e exibe cartas', async ({ page }) => {
  await page.goto(BASE);
  const cards = page.locator('.card');
  await expect(cards.first()).toBeVisible({ timeout: 5000 });
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(1);
  console.log(`  → ${count} cartas exibidas`);
});

// ─────────────────────────────────────────────
// CT-02 – Busca por nome retorna resultado
// ─────────────────────────────────────────────
test('CT-02 | Busca por "Pikachu" retorna carta', async ({ page }) => {
  await page.goto(BASE);
  await page.fill('#search-input', 'Pikachu');
  await page.click('#btn-search');
  const card = page.locator('.card', { hasText: 'Pikachu' });
  await expect(card).toBeVisible();
});

// ─────────────────────────────────────────────
// CT-03 – Busca sem resultado exibe mensagem
// ─────────────────────────────────────────────
test('CT-03 | Busca inexistente exibe "Nenhuma carta encontrada"', async ({ page }) => {
  await page.goto(BASE);
  await page.fill('#search-input', 'xyzabc123');
  await page.click('#btn-search');
  await expect(page.locator('#cards-grid')).toContainText('Nenhuma carta encontrada');
});

// ─────────────────────────────────────────────
// CT-04 – Modal abre ao clicar na carta
// ─────────────────────────────────────────────
test('CT-04 | Modal de detalhe abre ao clicar na carta', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('.card').first().click();
  await expect(page.locator('#card-modal')).not.toHaveClass(/hidden/);
  await expect(page.locator('#modal-name')).not.toBeEmpty();
});

// ─────────────────────────────────────────────
// CT-05 – Fechar modal
// ─────────────────────────────────────────────
test('CT-05 | Modal fecha ao clicar no botão X', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('.card').first().click();
  await page.click('.modal-close');
  await expect(page.locator('#card-modal')).toHaveClass(/hidden/);
});

// ─────────────────────────────────────────────
// CT-06 – Adicionar carta ao carrinho
// ─────────────────────────────────────────────
test('CT-06 | Adicionar carta ao carrinho atualiza badge', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('.btn-buy').first().click();
  const badge = page.locator('#cart-badge');
  await expect(badge).toBeVisible();
  const text = await badge.textContent();
  expect(parseInt(text)).toBeGreaterThanOrEqual(1);
});

// ─────────────────────────────────────────────
// CT-07 – Login com campos vazios bloqueado
// ─────────────────────────────────────────────
test('CT-07 | Login com campos vazios é bloqueado pelo HTML', async ({ page }) => {
  await page.goto(LOGIN_URL);
  await page.click('button[type="submit"]');
  // campo required impede submit — URL não muda
  expect(page.url()).toContain('login.html');
});

// ─────────────────────────────────────────────
// CT-08 – Cadastro e login completo
// ─────────────────────────────────────────────
test('CT-08 | Cadastro de novo usuário e login', async ({ page }) => {
  await page.goto(LOGIN_URL);
  // ir para cadastro
  await page.click('#link-cadastro');
  const user = 'testuser_' + Date.now();
  await page.fill('#cad-user', user);
  await page.fill('#cad-pass', 'senha123');
  await page.click('#form-cadastro button[type="submit"]');
  await expect(page.locator('#msg-cadastro')).toContainText('Cadastro realizado');

  // fazer login
  await page.fill('#login-user', user);
  await page.fill('#login-pass', 'senha123');
  await page.click('#form-login button[type="submit"]');
  await expect(page).toHaveURL(/index\.html/);
});

// ─────────────────────────────────────────────
// CT-09 – Login com senha errada
// ─────────────────────────────────────────────
test('CT-09 | Login com senha errada exibe erro', async ({ page }) => {
  await page.goto(LOGIN_URL);
  // cadastrar usuário primeiro
  await page.click('#link-cadastro');
  const user = 'errouser_' + Date.now();
  await page.fill('#cad-user', user);
  await page.fill('#cad-pass', 'correta');
  await page.click('#form-cadastro button[type="submit"]');

  // tentar login com senha errada
  await page.fill('#login-user', user);
  await page.fill('#login-pass', 'errada');
  await page.click('#form-login button[type="submit"]');
  await expect(page.locator('#msg-login')).toContainText('incorretos');
});

// ─────────────────────────────────────────────
// CT-10 – Admin: preço negativo bloqueado
// ─────────────────────────────────────────────
test('CT-10 | Admin: inserção com preço negativo exibe erro', async ({ page }) => {
  await page.goto(ADMIN_URL);
  await page.fill('#card-name', 'CartaTeste');
  await page.fill('#card-type', 'Fogo');
  await page.fill('#card-price', '-50');
  await page.fill('#card-stock', '1');
  await page.click('#form-insert button[type="submit"]');
  await expect(page.locator('#msg-insert')).toContainText('inválido');
});

// ─────────────────────────────────────────────
// CT-11 – Admin: excluir carta inexistente
// ─────────────────────────────────────────────
test('CT-11 | Admin: excluir carta inexistente exibe erro', async ({ page }) => {
  await page.goto(ADMIN_URL);
  await page.fill('#delete-name', 'CartaQueNaoExiste999');
  await page.click('#form-delete button[type="submit"]');
  await expect(page.locator('#msg-delete')).toContainText('não encontrada');
});

// ─────────────────────────────────────────────
// CT-12 – Filtro por tipo funciona
// ─────────────────────────────────────────────
test('CT-12 | Filtro por tipo exibe apenas cartas do tipo selecionado', async ({ page }) => {
  await page.goto(BASE);
  // clicar no filtro Fogo
  const fogoBtn = page.locator('.type-btn', { hasText: 'Fogo' });
  await fogoBtn.click();
  const cards = page.locator('.card');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  // todas as cartas visíveis devem ter badge Fogo
  const badges = page.locator('.type-badge');
  const total = await badges.count();
  for (let i = 0; i < total; i++) {
    await expect(badges.nth(i)).toHaveText('Fogo');
  }
});
