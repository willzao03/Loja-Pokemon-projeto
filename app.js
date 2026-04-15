// =============================================
// LOJA POKÉMON - app.js
// CRUD com localStorage (pronto para MongoDB)
// =============================================

const DB_CARDS = 'pokemon_cards';
const DB_USERS = 'pokemon_users';
const DB_SESSION = 'pokemon_session';

// --- UTILITÁRIOS ---
function getCards() {
  return JSON.parse(localStorage.getItem(DB_CARDS) || '[]');
}
function saveCards(cards) {
  localStorage.setItem(DB_CARDS, JSON.stringify(cards));
}
function getUsers() {
  return JSON.parse(localStorage.getItem(DB_USERS) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(DB_USERS, JSON.stringify(users));
}
function getSession() {
  return JSON.parse(localStorage.getItem(DB_SESSION) || 'null');
}
function setSession(user) {
  localStorage.setItem(DB_SESSION, JSON.stringify(user));
}
function logout() {
  localStorage.removeItem(DB_SESSION);
  window.location.href = 'login.html';
}

// --- SEED: cartas iniciais ---
function seedCards() {
  if (getCards().length > 0) return;
  const initial = [
    { id: 1,  name: 'Charizard',   type: 'Fogo',      price: 250.00, image: 'https://images.pokemontcg.io/base1/4_hires.png',   stock: 3 },
    { id: 2,  name: 'Blastoise',   type: 'Água',      price: 180.00, image: 'https://images.pokemontcg.io/base1/2_hires.png',   stock: 5 },
    { id: 3,  name: 'Venusaur',    type: 'Planta',    price: 160.00, image: 'https://images.pokemontcg.io/base1/15_hires.png',  stock: 4 },
    { id: 4,  name: 'Pikachu',     type: 'Elétrico',  price: 90.00,  image: 'https://images.pokemontcg.io/base1/58_hires.png',  stock: 10 },
    { id: 5,  name: 'Mewtwo',      type: 'Psíquico',  price: 320.00, image: 'https://images.pokemontcg.io/base1/10_hires.png',  stock: 2 },
    { id: 6,  name: 'Gengar',      type: 'Fantasma',  price: 210.00, image: 'https://images.pokemontcg.io/base1/5_hires.png',   stock: 3 },
    { id: 7,  name: 'Alakazam',    type: 'Psíquico',  price: 195.00, image: 'https://images.pokemontcg.io/base1/1_hires.png',   stock: 4 },
    { id: 8,  name: 'Machamp',     type: 'Lutador',   price: 140.00, image: 'https://images.pokemontcg.io/base1/8_hires.png',   stock: 6 },
    { id: 9,  name: 'Ninetales',   type: 'Fogo',      price: 130.00, image: 'https://images.pokemontcg.io/base1/12_hires.png',  stock: 5 },
    { id: 10, name: 'Gyarados',    type: 'Água',      price: 175.00, image: 'https://images.pokemontcg.io/base1/6_hires.png',   stock: 3 },
    { id: 11, name: 'Clefairy',    type: 'Normal',    price: 75.00,  image: 'https://images.pokemontcg.io/base1/5_hires.png',   stock: 8 },
    { id: 12, name: 'Zapdos',      type: 'Elétrico',  price: 280.00, image: 'https://images.pokemontcg.io/base1/16_hires.png',  stock: 2 },
    { id: 13, name: 'Moltres',     type: 'Fogo',      price: 270.00, image: 'https://images.pokemontcg.io/base1/12_hires.png',  stock: 2 },
    { id: 14, name: 'Articuno',    type: 'Gelo',      price: 265.00, image: 'https://images.pokemontcg.io/base1/17_hires.png',  stock: 2 },
    { id: 15, name: 'Raichu',      type: 'Elétrico',  price: 110.00, image: 'https://images.pokemontcg.io/base1/14_hires.png',  stock: 5 },
    { id: 16, name: 'Poliwrath',   type: 'Água',      price: 120.00, image: 'https://images.pokemontcg.io/base1/13_hires.png',  stock: 4 },
    { id: 17, name: 'Nidoking',    type: 'Veneno',    price: 145.00, image: 'https://images.pokemontcg.io/base1/11_hires.png',  stock: 4 },
    { id: 18, name: 'Magneton',    type: 'Elétrico',  price: 95.00,  image: 'https://images.pokemontcg.io/base1/9_hires.png',   stock: 6 },
    { id: 19, name: 'Electabuzz',  type: 'Elétrico',  price: 100.00, image: 'https://images.pokemontcg.io/base1/20_hires.png',  stock: 5 },
    { id: 20, name: 'Hitmonchan',  type: 'Lutador',   price: 115.00, image: 'https://images.pokemontcg.io/base1/7_hires.png',   stock: 5 },
  ];
  saveCards(initial);
}

// --- RENDERIZAR CARDS NA INDEX ---
function renderCards(filter = '') {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  const cards = getCards().filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.type.toLowerCase().includes(filter.toLowerCase())
  );
  if (cards.length === 0) {
    grid.innerHTML = '<p style="color:#aaa;text-align:center;grid-column:1/-1">Nenhuma carta encontrada.</p>';
    return;
  }
  grid.innerHTML = cards.map(c => `
    <div class="card">
      <img src="${c.image}" alt="${c.name}" onerror="this.src='https://via.placeholder.com/200x200?text=Carta'">
      <div class="card-info">
        <p class="type">${c.type}</p>
        <h3>${c.name}</h3>
        <p class="price">R$ ${c.price.toFixed(2)}</p>
        <a class="btn-buy" href="#">Comprar</a>
      </div>
    </div>
  `).join('');
}

// --- BUSCA ---
function initSearch() {
  const btn = document.getElementById('btn-search');
  const input = document.getElementById('search-input');
  if (!btn || !input) return;
  btn.addEventListener('click', () => renderCards(input.value));
  input.addEventListener('keyup', e => { if (e.key === 'Enter') renderCards(input.value); });
}

// --- ADMIN: INSERIR CARTA ---
function initAdminInsert() {
  const form = document.getElementById('form-insert');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('card-name').value.trim();
    const type  = document.getElementById('card-type').value.trim();
    const price = parseFloat(document.getElementById('card-price').value);
    const image = document.getElementById('card-image').value.trim();
    const stock = parseInt(document.getElementById('card-stock').value);
    const msg   = document.getElementById('msg-insert');

    // Validação: preço negativo (Cenário 3)
    if (price < 0) {
      showMsg(msg, 'Preço inválido. Insira um valor positivo.', 'error');
      return;
    }
    if (!name || !type) {
      showMsg(msg, 'Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const cards = getCards();
    const newCard = {
      id: Date.now(),
      name, type, price,
      image: image || 'https://via.placeholder.com/200x200?text=Carta',
      stock
    };
    cards.push(newCard);
    saveCards(cards);
    showMsg(msg, `Carta "${name}" inserida com sucesso!`, 'success');
    form.reset();
  });
}

// --- ADMIN: EXCLUIR CARTA ---
function initAdminDelete() {
  const form = document.getElementById('form-delete');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('delete-name').value.trim().toLowerCase();
    const msg  = document.getElementById('msg-delete');
    const cards = getCards();
    const idx = cards.findIndex(c => c.name.toLowerCase() === name);

    // Cenário 4 e 5: carta não encontrada
    if (idx === -1) {
      showMsg(msg, 'Carta não encontrada.', 'error');
      return;
    }
    cards.splice(idx, 1);
    saveCards(cards);
    showMsg(msg, 'Carta removida com sucesso!', 'success');
    form.reset();
  });
}

// --- LOGIN ---
function initLogin() {
  const formLogin    = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  if (!formLogin) return;

  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const msg      = document.getElementById('msg-login');
    const users    = getUsers();
    const user     = users.find(u => u.username === username);

    // Cenário 1: senha incorreta
    if (!user || user.password !== password) {
      showMsg(msg, 'Usuário ou senha incorretos.', 'error');
      return;
    }
    setSession(user);
    window.location.href = 'index.html';
  });

  formCadastro.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('cad-user').value.trim();
    const password = document.getElementById('cad-pass').value;
    const msg      = document.getElementById('msg-cadastro');
    const users    = getUsers();

    // Cenário 2: usuário já existe
    if (users.find(u => u.username === username)) {
      showMsg(msg, 'Usuário já existe. Escolha outro nome.', 'error');
      return;
    }
    users.push({ username, password });
    saveUsers(users);
    showMsg(msg, 'Cadastro realizado! Faça login.', 'success');
    formCadastro.reset();
    toggleForms();
  });
}

// --- TOGGLE LOGIN / CADASTRO ---
function toggleForms() {
  document.getElementById('section-login').classList.toggle('hidden');
  document.getElementById('section-cadastro').classList.toggle('hidden');
}

// --- MENSAGEM ---
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `msg ${type}`;
  setTimeout(() => { el.className = 'msg'; }, 4000);
}

// --- HEADER: usuário logado ---
function updateHeader() {
  const session = getSession();
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  if (session) {
    navUser.innerHTML = `<span style="color:#ffcb05">Olá, ${session.username}</span>
      <a href="#" onclick="logout()" style="margin-left:12px;color:#fff">Sair</a>`;
  }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  seedCards();
  renderCards();
  initSearch();
  initAdminInsert();
  initAdminDelete();
  initLogin();
  updateHeader();

  // toggle entre login e cadastro
  const linkCad = document.getElementById('link-cadastro');
  const linkLog = document.getElementById('link-login');
  if (linkCad) linkCad.addEventListener('click', toggleForms);
  if (linkLog) linkLog.addEventListener('click', toggleForms);
});
