// =============================================
// LOJA POKÉMON - app.js
// =============================================

const DB_CARDS   = 'pokemon_cards';
const DB_USERS   = 'pokemon_users';
const DB_SESSION = 'pokemon_session';
const DB_CART    = 'pokemon_cart';
const SEED_VERSION = 'v3';

// --- STORAGE ---
const getCards   = () => JSON.parse(localStorage.getItem(DB_CARDS)   || '[]');
const saveCards  = v  => localStorage.setItem(DB_CARDS,   JSON.stringify(v));
const getUsers   = () => JSON.parse(localStorage.getItem(DB_USERS)   || '[]');
const saveUsers  = v  => localStorage.setItem(DB_USERS,   JSON.stringify(v));
const getSession = () => JSON.parse(localStorage.getItem(DB_SESSION) || 'null');
const setSession = v  => localStorage.setItem(DB_SESSION, JSON.stringify(v));
const getCart    = () => JSON.parse(localStorage.getItem(DB_CART)    || '[]');
const saveCart   = v  => localStorage.setItem(DB_CART,    JSON.stringify(v));

function logout() {
  localStorage.removeItem(DB_SESSION);
  window.location.href = 'login.html';
}

// --- TIPO → COR ---
const typeColors = {
  'Fogo':     '#e3350d',
  'Água':     '#1565c0',
  'Planta':   '#2e7d32',
  'Elétrico': '#f9a825',
  'Psíquico': '#7b1fa2',
  'Fantasma': '#4a148c',
  'Lutador':  '#bf360c',
  'Veneno':   '#558b2f',
  'Gelo':     '#0097a7',
  'Normal':   '#546e7a',
  'Dragão':   '#1a237e',
  'Pedra':    '#795548',
};
const typeColor = t => typeColors[t] || '#555';

// --- SEED ---
function seedCards() {
  if (localStorage.getItem('seed_version') === SEED_VERSION) return;
  localStorage.removeItem(DB_CARDS);
  const initial = [
    { id:1,  name:'Charizard',   type:'Fogo',      price:250.00, image:'https://images.pokemontcg.io/base1/4_hires.png',   stock:3  },
    { id:2,  name:'Blastoise',   type:'Água',      price:180.00, image:'https://images.pokemontcg.io/base1/2_hires.png',   stock:5  },
    { id:3,  name:'Venusaur',    type:'Planta',    price:160.00, image:'https://images.pokemontcg.io/base1/15_hires.png',  stock:4  },
    { id:4,  name:'Pikachu',     type:'Elétrico',  price:90.00,  image:'https://images.pokemontcg.io/base1/58_hires.png',  stock:10 },
    { id:5,  name:'Mewtwo',      type:'Psíquico',  price:320.00, image:'https://images.pokemontcg.io/base1/10_hires.png',  stock:2  },
    { id:6,  name:'Gengar',      type:'Fantasma',  price:210.00, image:'https://images.pokemontcg.io/base1/5_hires.png',   stock:3  },
    { id:7,  name:'Alakazam',    type:'Psíquico',  price:195.00, image:'https://images.pokemontcg.io/base1/1_hires.png',   stock:4  },
    { id:8,  name:'Machamp',     type:'Lutador',   price:140.00, image:'https://images.pokemontcg.io/base1/8_hires.png',   stock:6  },
    { id:9,  name:'Ninetales',   type:'Fogo',      price:130.00, image:'https://images.pokemontcg.io/base1/12_hires.png',  stock:5  },
    { id:10, name:'Gyarados',    type:'Água',      price:175.00, image:'https://images.pokemontcg.io/base1/6_hires.png',   stock:3  },
    { id:11, name:'Clefairy',    type:'Normal',    price:75.00,  image:'https://images.pokemontcg.io/base1/5_hires.png',   stock:8  },
    { id:12, name:'Zapdos',      type:'Elétrico',  price:280.00, image:'https://images.pokemontcg.io/base1/16_hires.png',  stock:2  },
    { id:13, name:'Moltres',     type:'Fogo',      price:270.00, image:'https://images.pokemontcg.io/base1/12_hires.png',  stock:2  },
    { id:14, name:'Articuno',    type:'Gelo',      price:265.00, image:'https://images.pokemontcg.io/base1/17_hires.png',  stock:2  },
    { id:15, name:'Raichu',      type:'Elétrico',  price:110.00, image:'https://images.pokemontcg.io/base1/14_hires.png',  stock:5  },
    { id:16, name:'Poliwrath',   type:'Água',      price:120.00, image:'https://images.pokemontcg.io/base1/13_hires.png',  stock:4  },
    { id:17, name:'Nidoking',    type:'Veneno',    price:145.00, image:'https://images.pokemontcg.io/base1/11_hires.png',  stock:4  },
    { id:18, name:'Magneton',    type:'Elétrico',  price:95.00,  image:'https://images.pokemontcg.io/base1/9_hires.png',   stock:6  },
    { id:19, name:'Electabuzz',  type:'Elétrico',  price:100.00, image:'https://images.pokemontcg.io/base1/20_hires.png',  stock:5  },
    { id:20, name:'Hitmonchan',  type:'Lutador',   price:115.00, image:'https://images.pokemontcg.io/base1/7_hires.png',   stock:5  },
  ];
  saveCards(initial);
  localStorage.setItem('seed_version', SEED_VERSION);
}

// --- FILTROS DE TIPO ---
function renderTypeFilters() {
  const wrap = document.getElementById('type-filters');
  if (!wrap) return;
  const types = [...new Set(getCards().map(c => c.type))].sort();
  wrap.innerHTML = `<button class="type-btn active" data-type="">Todos</button>` +
    types.map(t => `<button class="type-btn" data-type="${t}" style="--tc:${typeColor(t)}">${t}</button>`).join('');
  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;
    wrap.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const search = document.getElementById('search-input')?.value || '';
    renderCards(search, btn.dataset.type);
  });
}

// --- RENDER CARDS ---
function renderCards(filter = '', typeFilter = '') {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  const sort = document.getElementById('sort-select')?.value || 'name';
  let cards = getCards().filter(c => {
    const matchText = c.name.toLowerCase().includes(filter.toLowerCase()) ||
                      c.type.toLowerCase().includes(filter.toLowerCase());
    const matchType = !typeFilter || c.type === typeFilter;
    return matchText && matchType;
  });
  if (sort === 'price-asc')  cards.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') cards.sort((a,b) => b.price - a.price);
  if (sort === 'name')       cards.sort((a,b) => a.name.localeCompare(b.name));

  if (cards.length === 0) {
    grid.innerHTML = '<p style="color:#aaa;text-align:center;grid-column:1/-1">Nenhuma carta encontrada.</p>';
    return;
  }
  grid.innerHTML = cards.map(c => `
    <div class="card" onclick="openModal(${c.id})">
      <img src="${c.image}" alt="${c.name}" onerror="this.src='https://via.placeholder.com/200x200?text=Carta'">
      <div class="card-info">
        <span class="type-badge" style="background:${typeColor(c.type)}">${c.type}</span>
        <h3>${c.name}</h3>
        <p class="price">R$ ${c.price.toFixed(2)}</p>
        <button class="btn-buy" onclick="event.stopPropagation();addToCart(${c.id})">🛒 Adicionar</button>
      </div>
    </div>
  `).join('');
}

// --- BUSCA + ORDENAÇÃO ---
function initSearch() {
  const btn    = document.getElementById('btn-search');
  const input  = document.getElementById('search-input');
  const select = document.getElementById('sort-select');
  if (!input) return;
  const doRender = () => {
    const activeType = document.querySelector('.type-btn.active')?.dataset.type || '';
    renderCards(input.value, activeType);
  };
  btn?.addEventListener('click', doRender);
  input.addEventListener('keyup', e => { if (e.key === 'Enter') doRender(); });
  select?.addEventListener('change', doRender);
}

// --- MODAL DETALHE ---
function openModal(id) {
  const card = getCards().find(c => c.id === id);
  if (!card) return;
  document.getElementById('modal-img').src       = card.image;
  document.getElementById('modal-name').textContent  = card.name;
  document.getElementById('modal-type').textContent  = card.type;
  document.getElementById('modal-type').style.background = typeColor(card.type);
  document.getElementById('modal-price').textContent = `R$ ${card.price.toFixed(2)}`;
  document.getElementById('modal-stock').textContent = `Estoque: ${card.stock}`;
  document.getElementById('modal-buy').onclick = () => { addToCart(id); closeModal(); };
  document.getElementById('card-modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('card-modal')?.classList.add('hidden');
}

// --- CARRINHO ---
function addToCart(id) {
  const card = getCards().find(c => c.id === id);
  if (!card) return;
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id: card.id, name: card.name, price: card.price, image: card.image, qty: 1 });
  saveCart(cart);
  updateCartBadge();
  showToast(`"${card.name}" adicionado ao carrinho!`);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-block' : 'none';
}

function openCart() {
  const cart = getCart();
  const panel = document.getElementById('cart-panel');
  const list  = document.getElementById('cart-list');
  if (!panel || !list) return;
  if (cart.length === 0) {
    list.innerHTML = '<p style="color:#aaa;text-align:center">Carrinho vazio.</p>';
  } else {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    list.innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${i.image}" alt="${i.name}" onerror="this.src='https://via.placeholder.com/60x60?text=?'">
        <div class="cart-item-info">
          <strong>${i.name}</strong>
          <span>R$ ${i.price.toFixed(2)} x ${i.qty}</span>
        </div>
        <button onclick="removeFromCart(${i.id})" class="btn-remove">✕</button>
      </div>
    `).join('') + `<div class="cart-total">Total: R$ ${total.toFixed(2)}</div>
      <button class="btn-buy" style="width:100%;margin-top:10px" onclick="finalizarCompra()">Finalizar Compra</button>`;
  }
  panel.classList.remove('hidden');
}

function closeCart() {
  document.getElementById('cart-panel')?.classList.add('hidden');
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartBadge();
  openCart();
}

function finalizarCompra() {
  saveCart([]);
  updateCartBadge();
  closeCart();
  showToast('Compra finalizada! Obrigado 🎉');
}

// --- TOAST ---
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast show';
  setTimeout(() => t.className = 'toast', 2800);
}

// --- ADMIN: INSERIR ---
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
    if (price < 0) { showMsg(msg, 'Preço inválido. Insira um valor positivo.', 'error'); return; }
    if (!name || !type) { showMsg(msg, 'Preencha todos os campos obrigatórios.', 'error'); return; }
    const cards = getCards();
    cards.push({ id: Date.now(), name, type, price, image: image || 'https://via.placeholder.com/200x200?text=Carta', stock });
    saveCards(cards);
    showMsg(msg, `Carta "${name}" inserida com sucesso!`, 'success');
    form.reset();
  });
}

// --- ADMIN: EDITAR ---
function initAdminEdit() {
  const formSearch = document.getElementById('form-edit-search');
  const formEdit   = document.getElementById('form-edit');
  if (!formSearch) return;

  formSearch.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('edit-search').value.trim().toLowerCase();
    const msg   = document.getElementById('msg-edit');
    const card  = getCards().find(c => c.name.toLowerCase() === name);
    if (!card) { showMsg(msg, 'Carta não encontrada.', 'error'); formEdit.classList.add('hidden'); return; }
    document.getElementById('edit-id').value    = card.id;
    document.getElementById('edit-name').value  = card.name;
    document.getElementById('edit-type').value  = card.type;
    document.getElementById('edit-price').value = card.price;
    document.getElementById('edit-stock').value = card.stock;
    document.getElementById('edit-image').value = card.image;
    formEdit.classList.remove('hidden');
  });

  formEdit.addEventListener('submit', e => {
    e.preventDefault();
    const id    = parseInt(document.getElementById('edit-id').value);
    const price = parseFloat(document.getElementById('edit-price').value);
    const msg   = document.getElementById('msg-edit');
    if (price < 0) { showMsg(msg, 'Preço inválido.', 'error'); return; }
    const cards = getCards();
    const idx   = cards.findIndex(c => c.id === id);
    if (idx === -1) { showMsg(msg, 'Carta não encontrada.', 'error'); return; }
    cards[idx] = {
      ...cards[idx],
      name:  document.getElementById('edit-name').value.trim(),
      type:  document.getElementById('edit-type').value.trim(),
      price,
      stock: parseInt(document.getElementById('edit-stock').value),
      image: document.getElementById('edit-image').value.trim() || cards[idx].image,
    };
    saveCards(cards);
    showMsg(msg, 'Carta atualizada com sucesso!', 'success');
    formEdit.classList.add('hidden');
    formSearch.reset();
  });
}

// --- ADMIN: EXCLUIR ---
function initAdminDelete() {
  const form = document.getElementById('form-delete');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('delete-name').value.trim().toLowerCase();
    const msg   = document.getElementById('msg-delete');
    const cards = getCards();
    const idx   = cards.findIndex(c => c.name.toLowerCase() === name);
    if (idx === -1) { showMsg(msg, 'Carta não encontrada.', 'error'); return; }
    cards.splice(idx, 1);
    saveCards(cards);
    showMsg(msg, 'Carta removida com sucesso!', 'success');
    form.reset();
  });
}

// --- LOGIN / CADASTRO ---
function initLogin() {
  const formLogin    = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  if (!formLogin) return;

  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const msg      = document.getElementById('msg-login');
    const user     = getUsers().find(u => u.username === username);
    if (!user || user.password !== password) { showMsg(msg, 'Usuário ou senha incorretos.', 'error'); return; }
    setSession(user);
    window.location.href = 'index.html';
  });

  formCadastro.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('cad-user').value.trim();
    const password = document.getElementById('cad-pass').value;
    const msg      = document.getElementById('msg-cadastro');
    if (getUsers().find(u => u.username === username)) { showMsg(msg, 'Usuário já existe. Escolha outro nome.', 'error'); return; }
    const users = getUsers();
    users.push({ username, password, role: 'user' });
    saveUsers(users);
    showMsg(msg, 'Cadastro realizado! Faça login.', 'success');
    formCadastro.reset();
    toggleForms();
  });
}

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

// --- HEADER ---
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
  renderTypeFilters();
  initSearch();
  initAdminInsert();
  initAdminEdit();
  initAdminDelete();
  initLogin();
  updateHeader();
  updateCartBadge();

  document.getElementById('link-cadastro')?.addEventListener('click', toggleForms);
  document.getElementById('link-login')?.addEventListener('click', toggleForms);
  document.getElementById('card-modal')?.addEventListener('click', e => { if (e.target.id === 'card-modal') closeModal(); });
});
