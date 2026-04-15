# AC3 – Quality Assurance | Loja Pokémon
**Instituição:** UNIFECAF  
**Professor:** Rodrigo Moreira  
**Grupo:**
- Vinnicius Patera Heinz – 103003
- Matheus Rafaldini Nacacura Muniz – 98871
- Willian Gabriel da Costa – 102155
- Gabriel Silva do Nascimento – 104373

**Repositório:** https://github.com/willzao03/Loja-Pokemon-projeto

---

## PASSO 1 – Descrição do Sistema

**Nome:** Loja Pokémon – E-commerce de Cartas  
**Objetivo:** Plataforma digital para venda e organização de cartas Pokémon colecionáveis.

**O que o sistema faz:**
- Exibe catálogo de cartas com filtros por tipo e ordenação por preço/nome
- Permite cadastro e login de usuários
- Gerencia carrinho de compras com finalização de pedido
- Painel administrativo com CRUD completo de cartas (inserir, editar, excluir)
- Armazena dados via localStorage (estruturado para migração ao MongoDB)

**Fluxo resumido:**
1. Usuário acessa `index.html` → visualiza cartas
2. Filtra por tipo ou busca por nome
3. Clica na carta → modal com detalhes → adiciona ao carrinho
4. Finaliza compra
5. Admin acessa `admin.html` → gerencia catálogo

---

## PASSO 2 – Escopo dos Testes

**O que será testado:**
- Autenticação (login e cadastro)
- CRUD de cartas (inserir, editar, excluir, consultar)
- Carrinho de compras
- Validações de dados (campos obrigatórios, preço negativo, duplicidade)
- API externa: Pokémon TCG API (https://api.pokemontcg.io/v2/cards)
- Google Cloud: disponibilidade e resposta HTTP do repositório via GitHub Pages

**Tipos de teste aplicados:**
- Teste funcional (comportamento das funcionalidades)
- Teste de validação de dados (entradas inválidas)
- Teste de API (Pokémon TCG API + Google Cloud)
- Teste com erro proposital
- Automação de testes (Python + Playwright)

---

## PASSO 3 – Casos de Teste

### CT-01 – Login com credenciais válidas
| Campo | Descrição |
|---|---|
| ID | CT-01 |
| Nome | Login com credenciais válidas |
| Objetivo | Verificar se o sistema autentica corretamente um usuário cadastrado |
| Entrada | Usuário: `willian` / Senha: `123456` |
| Passos | 1. Acessar login.html 2. Preencher usuário e senha 3. Clicar em Entrar |
| Resultado Esperado | Redirecionamento para index.html com sessão ativa |

---

### CT-02 – Login com senha incorreta
| Campo | Descrição |
|---|---|
| ID | CT-02 |
| Nome | Login com senha incorreta |
| Objetivo | Verificar se o sistema bloqueia acesso com senha errada |
| Entrada | Usuário: `willian` / Senha: `senhaerrada` |
| Passos | 1. Acessar login.html 2. Inserir usuário válido e senha errada 3. Clicar em Entrar |
| Resultado Esperado | Mensagem "Usuário ou senha incorretos." — acesso negado |

---

### CT-03 – Cadastro com usuário já existente
| Campo | Descrição |
|---|---|
| ID | CT-03 |
| Nome | Cadastro duplicado |
| Objetivo | Verificar se o sistema impede cadastro com username já em uso |
| Entrada | Usuário: `willian` (já cadastrado) |
| Passos | 1. Acessar login.html 2. Ir para Cadastro 3. Inserir mesmo username 4. Confirmar |
| Resultado Esperado | Mensagem "Usuário já existe. Escolha outro nome." |

---

### CT-04 – Inserção de carta com preço negativo
| Campo | Descrição |
|---|---|
| ID | CT-04 |
| Nome | Inserção com preço inválido |
| Objetivo | Verificar validação de preço negativo no admin |
| Entrada | Nome: `Snorlax` / Tipo: `Normal` / Preço: `-50` / Estoque: `2` |
| Passos | 1. Acessar admin.html 2. Preencher formulário com preço -50 3. Clicar em Adicionar |
| Resultado Esperado | Mensagem "Preço inválido. Insira um valor positivo." — carta não inserida |

---

### CT-05 – Exclusão de carta inexistente
| Campo | Descrição |
|---|---|
| ID | CT-05 |
| Nome | Exclusão de carta que não existe |
| Objetivo | Verificar comportamento ao tentar excluir carta inexistente |
| Entrada | Nome: `CartaQueNaoExiste` |
| Passos | 1. Acessar admin.html 2. Inserir nome inexistente no campo excluir 3. Confirmar |
| Resultado Esperado | Mensagem "Carta não encontrada." — sistema não quebra |

---

### CT-06 – Adicionar carta ao carrinho
| Campo | Descrição |
|---|---|
| ID | CT-06 |
| Nome | Adicionar ao carrinho |
| Objetivo | Verificar se o carrinho registra o item corretamente |
| Entrada | Clicar em "Adicionar" na carta Pikachu |
| Passos | 1. Acessar index.html 2. Clicar em Adicionar na carta Pikachu 3. Abrir carrinho |
| Resultado Esperado | Pikachu aparece no carrinho com preço R$ 90,00 e badge atualizado |

---

### CT-07 – Busca por carta inexistente
| Campo | Descrição |
|---|---|
| ID | CT-07 |
| Nome | Busca sem resultado |
| Objetivo | Verificar mensagem quando busca não retorna resultados |
| Entrada | Texto: `xyzabc123` |
| Passos | 1. Acessar index.html 2. Digitar `xyzabc123` na busca 3. Clicar em Buscar |
| Resultado Esperado | Mensagem "Nenhuma carta encontrada." — sistema não quebra |

---

### CT-08 – API Pokémon TCG (válida)
| Campo | Descrição |
|---|---|
| ID | CT-08 |
| Nome | Consulta válida na API Pokémon TCG |
| Objetivo | Verificar se a API retorna status 200 e dados de cartas |
| Entrada | GET `https://api.pokemontcg.io/v2/cards?q=name:Charizard&pageSize=1` |
| Passos | Executar requisição via Python/Postman |
| Resultado Esperado | Status 200, JSON com campo `data` contendo carta Charizard |

---

### CT-09 – API Pokémon TCG (inválida)
| Campo | Descrição |
|---|---|
| ID | CT-09 |
| Nome | Consulta inválida na API Pokémon TCG |
| Objetivo | Verificar comportamento com parâmetro inválido |
| Entrada | GET `https://api.pokemontcg.io/v2/cards?q=name:CARTAINEXISTENTE999` |
| Passos | Executar requisição via Python/Postman |
| Resultado Esperado | Status 200, campo `data` vazio `[]` |

---

### CT-10 – Google Cloud / GitHub Pages (disponibilidade)
| Campo | Descrição |
|---|---|
| ID | CT-10 |
| Nome | Disponibilidade do sistema hospedado |
| Objetivo | Verificar se o sistema está acessível via URL pública |
| Entrada | GET `https://willzao03.github.io/Loja-Pokemon-projeto/` |
| Passos | Executar requisição via Python |
| Resultado Esperado | Status 200 — página acessível |

---

## PASSO 4 – Execução dos Testes

| ID | Nome | Resultado | Comportamento Observado |
|---|---|---|---|
| CT-01 | Login válido | ✅ PASSOU | Redirecionou para index.html corretamente |
| CT-02 | Login senha errada | ✅ PASSOU | Exibiu mensagem de erro, bloqueou acesso |
| CT-03 | Cadastro duplicado | ✅ PASSOU | Exibiu "Usuário já existe" |
| CT-04 | Preço negativo | ✅ PASSOU | Exibiu "Preço inválido", não inseriu carta |
| CT-05 | Excluir inexistente | ✅ PASSOU | Exibiu "Carta não encontrada", sistema estável |
| CT-06 | Adicionar carrinho | ✅ PASSOU | Item apareceu no carrinho, badge atualizado |
| CT-07 | Busca sem resultado | ✅ PASSOU | Exibiu "Nenhuma carta encontrada" |
| CT-08 | API TCG válida (Charizard) | ✅ PASSOU | Status 200, 1 carta retornada |
| CT-08b | API TCG válida (Pikachu) | ✅ PASSOU | Status 200, 3 cartas retornadas |
| CT-09 | API TCG carta inexistente | ✅ PASSOU | Status 200, data: [] |
| CT-09b | API TCG endpoint inválido | ✅ PASSOU | Status 404 conforme esperado |
| CT-10 | GitHub Pages disponibilidade | ❌ FALHOU | Status 404 — GitHub Pages não ativado |
| CT-10b | Repositório GitHub acessível | ✅ PASSOU | Status 200 |
| CT-11 | API TCG campos obrigatórios | ✅ PASSOU | Campos id, name, images presentes |
| CT-12 | API TCG tempo de resposta | ✅ PASSOU | 0.52s (< 5s) |

---

## PASSO 5 – Evidências

> Prints devem ser coletados pelo integrante responsável durante a execução.
> Sugestão de prints:
> - Tela de login com mensagem de erro (CT-02)
> - Tela de cadastro com mensagem de duplicidade (CT-03)
> - Admin com mensagem de preço inválido (CT-04)
> - Carrinho com item adicionado (CT-06)
> - Terminal com output dos scripts Python
> - Postman com resposta da API TCG

---

## PASSO 6 – Testes com Erro Proposital

| Teste | Entrada | Comportamento Observado |
|---|---|---|
| Login campo vazio | Usuário: `` / Senha: `` | Campo HTML `required` bloqueia envio |
| Inserir carta sem nome | Nome: `` | Mensagem "Preencha todos os campos obrigatórios" |
| Preço como texto | Preço: `abc` | Campo `type=number` bloqueia entrada |
| Preço negativo | Preço: `-100` | Mensagem "Preço inválido" |
| Excluir com campo vazio | Nome: `` | Campo `required` bloqueia envio |
| Busca com caracteres especiais | `<script>alert(1)</script>` | Texto tratado como string, sem execução de código |

---

## PASSO 7 – Testes de API

**API utilizada:** Pokémon TCG API — https://api.pokemontcg.io/v2

### Testes Válidos
| Método | Endpoint | Status Esperado | Resultado |
|---|---|---|---|
| GET | `/v2/cards?q=name:Charizard&pageSize=1` | 200 | ✅ |
| GET | `/v2/cards?q=name:Pikachu&pageSize=3` | 200 | ✅ |

### Testes Inválidos
| Método | Endpoint | Status Esperado | Resultado |
|---|---|---|---|
| GET | `/v2/cards?q=name:CARTAINEXISTENTE999` | 200 (data vazio) | ✅ |
| GET | `/v2/cartasinvalidas` | 404 | ✅ |

---

## PASSO 8 – Automação de Testes

Ver arquivos:
- `testes/test_api.py` — testes automatizados Python (API + Google Cloud)
- `testes/test_sistema.js` — testes automatizados Playwright (sistema front-end)

---

## PASSO 9 – Bugs Identificados

### BUG-01 – GitHub Pages não ativado
| Campo | Descrição |
|---|---|
| Título | Sistema não acessível via URL pública |
| Descrição | O repositório existe no GitHub mas o GitHub Pages não foi ativado, impedindo acesso via URL pública |
| Como reproduzir | Acessar `https://willzao03.github.io/Loja-Pokemon-projeto/` |
| Impacto | Alto — sistema não pode ser avaliado online sem deploy |
| Sugestão | Ativar GitHub Pages em Settings > Pages > Branch: main |

---

### BUG-02 – Dados não persistem entre sessões diferentes
| Campo | Descrição |
|---|---|
| Título | localStorage não compartilhado entre usuários |
| Descrição | Por usar localStorage, cada navegador/dispositivo tem seu próprio banco de dados. Cartas inseridas por um usuário não aparecem para outro |
| Como reproduzir | Inserir carta no Chrome, abrir no Firefox — carta não aparece |
| Impacto | Médio — limitação arquitetural do front-end puro |
| Sugestão | Migrar para backend Node.js + MongoDB conforme planejado na documentação do projeto |

---

### BUG-03 – Imagens duplicadas no seed
| Campo | Descrição |
|---|---|
| Título | Cartas com imagens iguais |
| Descrição | Algumas cartas do seed usam a mesma URL de imagem (ex: Gengar e Clefairy usam base1/5) |
| Como reproduzir | Comparar visualmente as cartas na index.html |
| Impacto | Baixo — apenas visual |
| Sugestão | Corrigir URLs das imagens usando a Pokémon TCG API corretamente |

---

## PASSO 10 – Sugestões de Melhoria

### Melhoria Técnica 1 – Backend Node.js + MongoDB
Substituir o localStorage por um servidor Node.js com Express e banco MongoDB Atlas, permitindo persistência real e compartilhamento de dados entre usuários.

### Melhoria Técnica 2 – Autenticação com JWT
Implementar tokens JWT para autenticação segura, com diferenciação de roles (admin/usuário) e proteção das rotas do painel admin.

### Melhoria Geral – Deploy no Google Cloud / Vercel
Hospedar o sistema em uma plataforma de cloud (Google Cloud Run, Vercel ou Firebase Hosting) para que o sistema seja acessível publicamente com URL estável para apresentação e avaliação.

---

## PASSO 11 – Revisão Final

| Item | Status |
|---|---|
| Descrição do sistema | ✅ |
| Escopo dos testes | ✅ |
| 5+ casos de teste | ✅ (10 casos) |
| Execução registrada | ✅ |
| Evidências (prints) | ⚠️ Coletar durante execução |
| Testes com erro | ✅ |
| Testes de API | ✅ |
| 2+ testes automatizados | ✅ (scripts Python + JS) |
| 2+ bugs identificados | ✅ (3 bugs) |
| Melhorias | ✅ |
