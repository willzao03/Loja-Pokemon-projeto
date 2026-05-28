// =============================================
// LOJA POKÉMON - app.js
// =============================================

const DB_CARDS   = 'pokemon_cards';
const DB_USERS   = 'pokemon_users';
const DB_SESSION = 'pokemon_session';
const DB_CART    = 'pokemon_cart';
const SEED_VERSION = 'v3';

// --- STORAGE (com proteção contra JSON malformado) ---
function safeGet(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    console.warn(`[Storage] Dado corrompido em "${key}". Resetando.`);
    localStorage.removeItem(key);
    return fallback;
  }
}
const getCards   = () => safeGet(DB_CARDS,   []);
const saveCards  = v  => localStorage.setItem(DB_CARDS,   JSON.stringify(v));
const getUsers   = () => safeGet(DB_USERS,   []);
const saveUsers  = v  => localStorage.setItem(DB_USERS,   JSON.stringify(v));
const getSession = () => safeGet(DB_SESSION, null);
const setSession = v  => localStorage.setItem(DB_SESSION, JSON.stringify(v));
const getCart    = () => safeGet(DB_CART,    []);
const saveCart   = v  => localStorage.setItem(DB_CART,    JSON.stringify(v));

// --- SEGURANÇA: Hash de senha com SHA-256 (crypto nativo) ---
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// --- SEGURANÇA: Sanitizar texto para evitar XSS ---
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- SEGURANÇA: Toggle visibilidade da senha ---
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
    btn.setAttribute('aria-label', 'Ocultar senha');
  } else {
    input.type = 'password';
    btn.textContent = '👁';
    btn.setAttribute('aria-label', 'Mostrar senha');
  }
}

// --- SEGURANÇA: Avaliação de força de senha ---
const PASSWORD_RULES = [
  { id: 'req-length',  test: p => p.length >= 8,                         label: 'Mínimo 8 caracteres'           },
  { id: 'req-upper',   test: p => /[A-Z]/.test(p),                       label: 'Uma letra maiúscula'            },
  { id: 'req-lower',   test: p => /[a-z]/.test(p),                       label: 'Uma letra minúscula'            },
  { id: 'req-number',  test: p => /[0-9]/.test(p),                       label: 'Um número'                     },
  { id: 'req-special', test: p => /[^A-Za-z0-9]/.test(p),               label: 'Um caractere especial (!@#$...)'},
];

const STRENGTH_LEVELS = [
  { label: '',          color: '',        width: '0%'   },
  { label: 'Muito fraca', color: '#e3350d', width: '20%'  },
  { label: 'Fraca',     color: '#e3350d', width: '40%'  },
  { label: 'Média',     color: '#f9a825', width: '60%'  },
  { label: 'Forte',     color: '#4caf50', width: '80%'  },
  { label: 'Muito forte', color: '#00e676', width: '100%' },
];

function evaluatePasswordStrength(password) {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  return passed; // 0–5
}

function initPasswordStrength() {
  const input     = document.getElementById('cad-pass');
  const bar       = document.getElementById('strength-bar');
  const label     = document.getElementById('strength-label');
  const btnSubmit = document.getElementById('btn-cadastrar');
  if (!input || !bar) return;

  input.addEventListener('input', () => {
    const password = input.value;
    const score    = evaluatePasswordStrength(password);
    const level    = password.length === 0 ? STRENGTH_LEVELS[0] : STRENGTH_LEVELS[score];

    // Atualiza barra
    bar.style.width      = level.width;
    bar.style.background = level.color;

    // Atualiza label
    label.textContent  = level.label;
    label.style.color  = level.color;

    // Atualiza checklist
    PASSWORD_RULES.forEach(rule => {
      const li   = document.getElementById(rule.id);
      const icon = li?.querySelector('.req-icon');
      if (!li || !icon) return;
      const ok = rule.test(password);
      li.classList.toggle('ok', ok);
      icon.textContent = ok ? '✓' : '✗';
    });

    // Habilita botão só se todos os requisitos forem atendidos
    const allOk = score === PASSWORD_RULES.length;
    btnSubmit.disabled = !allOk;
  });
}

// --- SEGURANÇA: Validar URL de imagem ---
function isValidImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

// --- SEGURANÇA: Guard de autenticação para admin ---
// Qualquer usuário logado pode gerenciar cartas (vender/editar as suas)
function requireAdmin() {
  if (!isSessionValid()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem(DB_SESSION);
  localStorage.removeItem('login_attempts');
  localStorage.removeItem('login_blocked_until');
  clearInactivityTimer();
  window.location.href = 'login.html';
}

// --- SEGURANÇA: Rate limiting de login (máx 5 tentativas, bloqueio 30s) ---
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MS  = 30 * 1000; // 30 segundos

function getLoginAttempts() {
  return safeGet('login_attempts', { count: 0, lastAttempt: 0 });
}

function recordLoginFailure() {
  const data = getLoginAttempts();
  // Reseta contador se última tentativa foi há mais de BLOCK_DURATION_MS
  if (Date.now() - data.lastAttempt > BLOCK_DURATION_MS) {
    data.count = 0;
  }
  data.count++;
  data.lastAttempt = Date.now();
  localStorage.setItem('login_attempts', JSON.stringify(data));
}

function resetLoginAttempts() {
  localStorage.removeItem('login_attempts');
}

function isLoginBlocked() {
  const data = getLoginAttempts();
  if (data.count >= MAX_LOGIN_ATTEMPTS) {
    const elapsed = Date.now() - data.lastAttempt;
    if (elapsed < BLOCK_DURATION_MS) {
      const remaining = Math.ceil((BLOCK_DURATION_MS - elapsed) / 1000);
      return { blocked: true, remaining };
    }
    resetLoginAttempts();
  }
  return { blocked: false };
}

// --- SEGURANÇA: Expiração de sessão (2 horas) ---
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas

function setSessionWithExpiry(user) {
  const sessionData = { ...user, expiresAt: Date.now() + SESSION_DURATION_MS };
  setSession(sessionData);
}

function isSessionValid() {
  const session = getSession();
  if (!session) return false;
  if (session.expiresAt && Date.now() > session.expiresAt) {
    localStorage.removeItem(DB_SESSION);
    return false;
  }
  return true;
}

// --- SEGURANÇA: Logout automático por inatividade (15 minutos) ---
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutos
let inactivityTimer = null;

function resetInactivityTimer() {
  if (!isSessionValid()) return;
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    showToast('Sessão encerrada por inatividade.');
    setTimeout(logout, 1500);
  }, INACTIVITY_LIMIT_MS);
}

function clearInactivityTimer() {
  clearTimeout(inactivityTimer);
}

function initInactivityWatcher() {
  if (!isSessionValid()) return;
  ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'].forEach(evt =>
    document.addEventListener(evt, resetInactivityTimer, { passive: true })
  );
  resetInactivityTimer();
}

// --- SEGURANÇA: Proteção contra clickjacking ---
function preventClickjacking() {
  if (window.self !== window.top) {
    // A página está dentro de um iframe — sai imediatamente
    window.top.location = window.self.location;
  }
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

// --- SEED ADMIN (usuário padrão de administrador) ---
async function seedAdmin() {
  const users = getUsers();
  if (users.find(u => u.username === 'admin')) return; // já existe
  const hashedPassword = await hashPassword('Admin@123');
  users.push({ username: 'admin', password: hashedPassword, role: 'admin' });
  saveUsers(users);
}

// --- SEED CARDS ---
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
    types.map(t => `<button class="type-btn" data-type="${sanitize(t)}" style="--tc:${typeColor(t)}">${sanitize(t)}</button>`).join('');
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
      <img src="${sanitize(c.image)}" alt="${sanitize(c.name)}" onerror="this.src='https://via.placeholder.com/200x200?text=Carta'">
      <div class="card-info">
        <span class="type-badge" style="background:${typeColor(c.type)}">${sanitize(c.type)}</span>
        <h3>${sanitize(c.name)}</h3>
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
  document.getElementById('modal-img').src            = card.image;
  document.getElementById('modal-name').textContent   = card.name;
  document.getElementById('modal-type').textContent   = card.type;
  document.getElementById('modal-type').style.background = typeColor(card.type);
  document.getElementById('modal-price').textContent  = `R$ ${card.price.toFixed(2)}`;
  document.getElementById('modal-stock').textContent  = `Estoque: ${card.stock}`;
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
  const cart  = getCart();
  const panel = document.getElementById('cart-panel');
  const list  = document.getElementById('cart-list');
  if (!panel || !list) return;
  if (cart.length === 0) {
    list.innerHTML = '<p style="color:#aaa;text-align:center">Carrinho vazio.</p>';
  } else {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    list.innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${sanitize(i.image)}" alt="${sanitize(i.name)}" onerror="this.src='https://via.placeholder.com/60x60?text=?'">
        <div class="cart-item-info">
          <strong>${sanitize(i.name)}</strong>
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
  // Revalida preços buscando do DB_CARDS para evitar manipulação no localStorage
  const cart  = getCart();
  const cards = getCards();
  let total = 0;
  let manipulado = false;

  cart.forEach(item => {
    const cardOriginal = cards.find(c => c.id === item.id);
    if (cardOriginal && item.price !== cardOriginal.price) {
      manipulado = true;
      item.price = cardOriginal.price; // corrige o preço
    }
    if (cardOriginal) total += cardOriginal.price * item.qty;
  });

  if (manipulado) {
    showToast('Preços atualizados. Verifique o carrinho antes de finalizar.');
    saveCart(cart);
    openCart();
    return;
  }

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
    const name  = document.getElementById('card-name').value.trim().slice(0, 100);
    const type  = document.getElementById('card-type').value.trim().slice(0, 50);
    const price = parseFloat(document.getElementById('card-price').value);
    const image = document.getElementById('card-image').value.trim();
    const stock = parseInt(document.getElementById('card-stock').value);
    const msg   = document.getElementById('msg-insert');

    if (!name || !type)  { showMsg(msg, 'Preencha todos os campos obrigatórios.', 'error'); return; }
    if (price < 0)       { showMsg(msg, 'Preço inválido. Insira um valor positivo.', 'error'); return; }
    if (stock < 0)       { showMsg(msg, 'Estoque não pode ser negativo.', 'error'); return; }
    if (image && !isValidImageUrl(image)) { showMsg(msg, 'URL da imagem inválida.', 'error'); return; }

    const cards = getCards();
    cards.push({
      id: Date.now(),
      name,
      type,
      price,
      image: image || 'https://via.placeholder.com/200x200?text=Carta',
      stock,
      seller: getSession()?.username || 'desconhecido',
    });
    saveCards(cards);
    showMsg(msg, `Carta "${name}" anunciada com sucesso!`, 'success');
    form.reset();
    renderMyCards(); // atualiza o painel do vendedor
  });
}

// --- PAINEL: Minhas Cartas (lista do vendedor logado) ---
function renderMyCards() {
  const container = document.getElementById('my-cards-list');
  if (!container) return;
  const session = getSession();
  if (!session) return;

  const minhas = getCards().filter(c => c.seller === session.username);

  if (minhas.length === 0) {
    container.innerHTML = '<p style="color:#aaa;text-align:center;padding:16px">Você ainda não anunciou nenhuma carta.</p>';
    return;
  }

  container.innerHTML = minhas.map(c => `
    <div class="my-card-row" id="mycard-${c.id}">
      <img src="${sanitize(c.image)}" alt="${sanitize(c.name)}"
           onerror="this.src='https://via.placeholder.com/56x56?text=?'">
      <div class="my-card-info">
        <strong>${sanitize(c.name)}</strong>
        <span>
          <span class="type-badge" style="background:${typeColor(c.type)};font-size:0.7rem;padding:2px 8px">${sanitize(c.type)}</span>
          &nbsp;R$ ${c.price.toFixed(2)} &nbsp;·&nbsp; Qtd: ${c.stock}
        </span>
      </div>
      <div class="my-card-actions">
        <button class="btn-edit-card" onclick="openEditCard(${c.id})">✏️ Editar</button>
        <button class="btn-del-card"  onclick="deleteMyCard(${c.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openEditCard(id) {
  const card = getCards().find(c => c.id === id);
  if (!card) return;
  // Preenche o formulário de edição e rola até ele
  document.getElementById('edit-id').value    = card.id;
  document.getElementById('edit-name').value  = card.name;
  document.getElementById('edit-type').value  = card.type;
  document.getElementById('edit-price').value = card.price;
  document.getElementById('edit-stock').value = card.stock;
  document.getElementById('edit-image').value = card.image;
  const formEdit = document.getElementById('form-edit');
  formEdit.classList.remove('hidden');
  formEdit.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Destaca a linha selecionada
  document.querySelectorAll('.my-card-row').forEach(r => r.classList.remove('selected'));
  document.getElementById(`mycard-${id}`)?.classList.add('selected');
}

function deleteMyCard(id) {
  const cards = getCards();
  const card  = cards.find(c => c.id === id);
  if (!card) return;
  if (!confirm(`Remover "${card.name}" da loja? Esta ação não pode ser desfeita.`)) return;
  saveCards(cards.filter(c => c.id !== id));
  showToast(`"${card.name}" removida com sucesso.`);
  renderMyCards();
  document.getElementById('form-edit')?.classList.add('hidden');
}

// --- ADMIN: EDITAR (via painel) ---
function initAdminEdit() {
  const formEdit = document.getElementById('form-edit');
  if (!formEdit) return;

  formEdit.addEventListener('submit', e => {
    e.preventDefault();
    const id    = parseInt(document.getElementById('edit-id').value);
    const price = parseFloat(document.getElementById('edit-price').value);
    const image = document.getElementById('edit-image').value.trim();
    const msg   = document.getElementById('msg-edit');

    if (price < 0) { showMsg(msg, 'Preço inválido.', 'error'); return; }
    if (image && !isValidImageUrl(image)) { showMsg(msg, 'URL da imagem inválida.', 'error'); return; }

    const cards = getCards();
    const idx   = cards.findIndex(c => c.id === id);
    if (idx === -1) { showMsg(msg, 'Carta não encontrada.', 'error'); return; }

    cards[idx] = {
      ...cards[idx],
      name:  document.getElementById('edit-name').value.trim().slice(0, 100),
      type:  document.getElementById('edit-type').value.trim().slice(0, 50),
      price,
      stock: parseInt(document.getElementById('edit-stock').value),
      image: image || cards[idx].image,
    };
    saveCards(cards);
    showMsg(msg, 'Carta atualizada com sucesso!', 'success');
    formEdit.classList.add('hidden');
    document.querySelectorAll('.my-card-row').forEach(r => r.classList.remove('selected'));
    renderMyCards();
  });
}

// --- ADMIN: EXCLUIR (mantido para compatibilidade, mas não usado no painel) ---
function initAdminDelete() {}

// --- LOGIN / CADASTRO ---
function initLogin() {
  const formLogin    = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');
  if (!formLogin) return;

  // Login com hash de senha + rate limiting
  formLogin.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const msg      = document.getElementById('msg-login');

    if (!username || !password) { showMsg(msg, 'Preencha todos os campos.', 'error'); return; }

    // Verifica bloqueio por tentativas
    const block = isLoginBlocked();
    if (block.blocked) {
      showMsg(msg, `Muitas tentativas. Aguarde ${block.remaining}s para tentar novamente.`, 'error');
      return;
    }

    const hashedPassword = await hashPassword(password);
    const users = getUsers();
    const user  = users.find(u => u.username === username);

    // Suporte a senhas antigas (texto puro) e novas (hash) durante migração
    const senhaCorreta = user && (user.password === hashedPassword || user.password === password);
    if (!senhaCorreta) {
      recordLoginFailure();
      const block2 = isLoginBlocked();
      if (block2.blocked) {
        showMsg(msg, `Muitas tentativas. Conta bloqueada por ${block2.remaining}s.`, 'error');
      } else {
        const tentativas = getLoginAttempts();
        const restantes  = MAX_LOGIN_ATTEMPTS - tentativas.count;
        showMsg(msg, `Usuário ou senha incorretos. (${restantes} tentativa(s) restante(s))`, 'error');
      }
      return;
    }

    // Se senha ainda era texto puro, migra para hash
    if (user.password === password) {
      user.password = hashedPassword;
      saveUsers(users);
    }

    resetLoginAttempts();

    // Salva sessão sem a senha, com expiração
    const { password: _, ...userData } = user;
    setSessionWithExpiry(userData);
    window.location.href = 'index.html';
  });

  // Cadastro com hash de senha
  formCadastro.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('cad-user').value.trim().slice(0, 50);
    const password = document.getElementById('cad-pass').value;
    const msg      = document.getElementById('msg-cadastro');

    if (!username || !password)  { showMsg(msg, 'Preencha todos os campos.', 'error'); return; }
    if (password.length < 8)     { showMsg(msg, 'A senha deve ter pelo menos 8 caracteres.', 'error'); return; }
    if (evaluatePasswordStrength(password) < PASSWORD_RULES.length) {
      showMsg(msg, 'A senha não atende todos os requisitos de segurança.', 'error');
      return;
    }
    if (getUsers().find(u => u.username === username)) {
      showMsg(msg, 'Usuário já existe. Escolha outro nome.', 'error');
      return;
    }

    const hashedPassword = await hashPassword(password);
    const users = getUsers();
    users.push({ username, password: hashedPassword, role: 'user' });
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

// --- HEADER (sem innerHTML com dados do usuário) ---
function updateHeader() {
  const session = getSession();
  const navUser = document.getElementById('nav-user');
  const btnLogin = document.querySelector('a.btn-login');

  if (!navUser) return;

  if (session && isSessionValid()) {
    // Oculta o botão Login
    if (btnLogin) btnLogin.style.display = 'none';

    // Mostra nome + botão Sair
    const span = document.createElement('span');
    span.style.color = '#ffcb05';
    span.textContent = `Olá, ${session.username}`;

    const link = document.createElement('a');
    link.href = '#';
    link.style.cssText = 'margin-left:12px;color:#fff';
    link.textContent = 'Sair';
    link.addEventListener('click', logout);

    navUser.innerHTML = '';
    navUser.appendChild(span);
    navUser.appendChild(link);
  } else {
    // Garante que o botão Login aparece se não estiver logado
    if (btnLogin) btnLogin.style.display = '';
    navUser.innerHTML = '';
  }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
  // Proteção contra clickjacking
  preventClickjacking();

  // Verifica validade da sessão ao carregar qualquer página
  if (getSession() && !isSessionValid()) {
    showToast('Sua sessão expirou. Faça login novamente.');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    return;
  }

  seedCards();
  await seedAdmin();
  renderCards();
  renderTypeFilters();
  initSearch();
  initAdminInsert();
  initAdminEdit();
  initAdminDelete();
  initLogin();
  initPasswordStrength();
  updateHeader();
  updateCartBadge();
  renderMyCards();

  // Inicia watcher de inatividade se houver sessão ativa
  initInactivityWatcher();

  document.getElementById('link-cadastro')?.addEventListener('click', toggleForms);
  document.getElementById('link-login')?.addEventListener('click', toggleForms);
  document.getElementById('card-modal')?.addEventListener('click', e => { if (e.target.id === 'card-modal') closeModal(); });
});
