/**
 * AC3 – Loja Pokémon
 * Testes automatizados do sistema front-end via Playwright
 * 5 Testes Positivos + 5 Testes Negativos
 * Grupo: Vinnicius, Matheus, Willian, Gabriel – UNIFECAF
 *
 * Execução:
 *   npx playwright test test_sistema.js --reporter=list
 */

const { test, expect } = require('@playwright/test');

const BASE      = 'file://' + __dirname.replace(/\\/g, '/').replace('/testes', '') + '/index.html';
const LOGIN_URL = BASE.replace('index.html', 'login.html');
const ADMIN_URL = BASE.replace('index.html', 'admin.html');

// Injeta sessão válida para acessar o admin
async function injectSession(page, role = 'user') {
  await page.goto(BASE);
  await page.evaluate((r) => {
    localStorage.setItem('pokemon_session', JSON.stringify({
      username: r === 'admin' ? 'admin' : 'testvendedor',
      role: r,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000
    }));
  }, role);
}

// ══════════════════════════════════════════════
//  TESTES POSITIVOS
// ══════════════════════════════════════════════

test('POS-01 | Página inicial carrega e exibe cartas', async ({ page }) => {
  await page.goto(BASE);
  const cards = page.locator('.card');
  await expect(cards.first()).toBeVisible({ timeout: 5000 });
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(1);
  console.log(`  → ${count} cartas exibidas`);
});

test('POS-02 | Busca por "Pikachu" retorna a carta correta', async ({ page }) => {
  await page.goto(BASE);
  await page.fill('#search-input', 'Pikachu');
  await page.click('#btn-search');
  await expect(page.locator('.card', { hasText: 'Pikachu' })).toBeVisible();
});

test('POS-03 | Modal abre com dados ao clicar na carta', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('.card').first().click();
  await expect(page.locator('#card-modal')).not.toHaveClass(/hidden/);
  await expect(page.locator('#modal-name')).not.toBeEmpty();
  await expect(page.locator('#modal-price')).not.toBeEmpty();
});

test('POS-04 | Adicionar carta ao carrinho atualiza badge', async ({ page }) => {
  await page.goto(BASE);
  await page.locator('.btn-buy').first().click();
  const badge = page.locator('#cart-badge');
  await expect(badge).toBeVisible();
  expect(parseInt(await badge.textContent())).toBeGreaterThanOrEqual(1);
});

test('POS-05 | Admin acessível com sessão válida e exibe formulário', async ({ page }) => {
  await injectSession(page, 'user');
  await page.goto(ADMIN_URL);
  await expect(page.locator('#form-insert')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#card-name')).toBeVisible();
});

// ══════════════════════════════════════════════
//  TESTES NEGATIVOS
// ══════════════════════════════════════════════

test('NEG-01 | Busca inexistente exibe "Nenhuma carta encontrada"', async ({ page }) => {
  await page.goto(BASE);
  await page.fill('#search-input', 'xyzabc999inexistente');
  await page.click('#btn-search');
  await expect(page.locator('#cards-grid')).toContainText('Nenhuma carta encontrada');
});

test('NEG-02 | Login com senha errada exibe mensagem de erro', async ({ page }) => {
  await page.goto(LOGIN_URL);
  // Cadastra usuário com senha forte
  await page.click('#link-cadastro');
  const user = 'neguser_' + Date.now();
  await page.fill('#cad-user', user);
  await page.fill('#cad-pass', 'Senha@123');
  await page.click('#btn-cadastrar');
  await expect(page.locator('#msg-cadastro')).toContainText('Cadastro realizado');
  // Tenta login com senha errada
  await page.fill('#login-user', user);
  await page.fill('#login-pass', 'SenhaErrada@999');
  await page.click('#form-login button[type="submit"]');
  await expect(page.locator('#msg-login')).toContainText('incorretos');
});

test('NEG-03 | Admin redireciona para login sem sessão ativa', async ({ page }) => {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.removeItem('pokemon_session'));
  await page.goto(ADMIN_URL);
  await expect(page).toHaveURL(/login\.html/, { timeout: 5000 });
});

test('NEG-04 | Admin: preço negativo exibe erro de validação', async ({ page }) => {
  await injectSession(page, 'user');
  await page.goto(ADMIN_URL);
  await page.waitForSelector('#form-insert', { timeout: 8000 });
  await page.fill('#card-name', 'CartaInvalida');
  await page.fill('#card-type', 'Fogo');
  // Remove o atributo min para forçar valor negativo e testar validação JS
  await page.evaluate(() => {
    document.getElementById('card-price').removeAttribute('min');
    document.getElementById('card-price').value = '-50';
  });
  await page.fill('#card-stock', '1');
  await page.click('#form-insert button[type="submit"]');
  await expect(page.locator('#msg-insert')).toContainText('inválido', { timeout: 8000 });
});

test('NEG-05 | XSS: nome com script malicioso não executa alert', async ({ page }) => {
  test.setTimeout(60000);
  let alertDisparado = false;
  page.on('dialog', async dialog => {
    alertDisparado = true;
    await dialog.dismiss();
  });
  await page.goto(BASE);
  await page.waitForSelector('.card', { timeout: 10000 });
  await page.evaluate(() => {
    const cards = JSON.parse(localStorage.getItem('pokemon_cards') || '[]');
    cards.push({
      id: 99999,
      name: '<img src=x onerror=alert(1)>',
      type: 'Normal',
      price: 1.00,
      image: 'https://via.placeholder.com/200',
      stock: 1,
    });
    localStorage.setItem('pokemon_cards', JSON.stringify(cards));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  expect(alertDisparado).toBe(false);
});
