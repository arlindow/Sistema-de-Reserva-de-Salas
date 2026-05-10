# 🏢 Reserva de Salas

Sistema web completo para gerenciamento e reserva de salas, desenvolvido com Node.js, Express e SQLite. Projeto desenvolvido como parte da Atividade Prática 1.1 — Aplicando o SDLC.

---

## 📋 Funcionalidades

- **Autenticação** com JWT (perfis: `comum` e `admin`)
- **Reserva de salas** com verificação automática de conflitos de horário
- **Listagem de reservas** — usuário vê as próprias, admin vê todas
- **Cancelamento de reservas** (exclusivo para administradores)
- **Painel admin** com estatísticas em tempo real
- **Testes automatizados** com Jest e Supertest

---

## 🛠️ Tecnologias

| Camada      | Tecnologia                        |
|-------------|-----------------------------------|
| Back-end    | Node.js, Express                  |
| Banco       | SQLite (via `better-sqlite3`)     |
| Autenticação| JWT (`jsonwebtoken`), bcryptjs    |
| Front-end   | HTML, CSS, JavaScript puro        |
| Testes      | Jest, Supertest                   |
| Dev         | Nodemon, dotenv                   |

---

## 📁 Estrutura do Projeto

```
reserva-salas/
├── public/                     # Front-end
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── api.js              # Centraliza chamadas à API
│   ├── index.html              # Página de login
│   └── pages/
│       ├── dashboard.html      # Tela do usuário comum
│       └── admin.html          # Painel do administrador
├── src/                        # Back-end
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── salasController.js
│   │   └── reservasController.js
│   ├── database/
│   │   ├── db.js               # Criação das tabelas
│   │   ├── dbTeste.js          # Banco em memória para testes
│   │   └── seed.js             # Dados iniciais
│   ├── middlewares/
│   │   └── auth.js             # Verificação JWT e perfil admin
│   ├── routes/
│   │   ├── auth.js
│   │   ├── salas.js
│   │   └── reservas.js
│   ├── app.js                  # Configuração do Express
│   └── server.js               # Inicialização do servidor
├── tests/
│   ├── auth.test.js
│   └── reservas.test.js
├── .env
├── .gitignore
└── package.json
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/reserva-salas.git
cd reserva-salas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
JWT_SECRET=minha_chave_super_secreta_2024
```

### 4. Popule o banco com dados iniciais

```bash
node src/database/seed.js
```

### 5. Inicie o servidor

```bash
# Produção
npm start

# Desenvolvimento (com hot reload)
npm run dev
```

Acesse: **http://localhost:3000**

---

## 👤 Credenciais de Acesso

| Perfil    | E-mail              | Senha      |
|-----------|---------------------|------------|
| Admin     | admin@salas.com     | admin123   |
| Comum     | joao@salas.com      | joao123    |
| Comum     | maria@salas.com     | maria123   |

---

## 🔌 Endpoints da API

### Autenticação

| Método | Rota               | Acesso      | Descrição                    |
|--------|--------------------|-------------|------------------------------|
| POST   | `/api/auth/login`  | Público     | Realiza login, retorna JWT   |
| GET    | `/api/auth/perfil` | Autenticado | Retorna dados do usuário     |

### Salas

| Método | Rota                        | Acesso      | Descrição                          |
|--------|-----------------------------|-------------|------------------------------------|
| GET    | `/api/salas`                | Autenticado | Lista todas as salas ativas        |
| GET    | `/api/salas/disponiveis`    | Autenticado | Salas livres em um período         |

**Query params para `/api/salas/disponiveis`:**
```
?inicio=2025-06-01T09:00:00&fim=2025-06-01T10:00:00
```

### Reservas

| Método | Rota                  | Acesso      | Descrição                          |
|--------|-----------------------|-------------|------------------------------------|
| GET    | `/api/reservas`       | Autenticado | Lista reservas (filtrado por perfil)|
| POST   | `/api/reservas`       | Autenticado | Cria uma nova reserva              |
| DELETE | `/api/reservas/:id`   | Admin       | Cancela uma reserva existente      |

**Corpo para `POST /api/reservas`:**
```json
{
  "sala_id": 1,
  "inicio": "2025-06-01T09:00:00",
  "fim": "2025-06-01T10:00:00",
  "descricao": "Reunião de planejamento"
}
```

**Corpo para `DELETE /api/reservas/:id`:**
```json
{
  "motivo_cancelamento": "Sala necessária para outro evento"
}
```

---

## 🧪 Testes

```bash
npm test
```

**Cobertura dos testes:**

```
PASS  tests/auth.test.js
  POST /api/auth/login
    ✅ login com credenciais válidas retorna token
    ❌ senha errada retorna 401
    ❌ email inexistente retorna 401
    ❌ campos vazios retornam 400

PASS  tests/reservas.test.js
  GET /api/salas
    ✅ retorna lista de salas autenticado
    ❌ sem token retorna 401
  POST /api/reservas
    ✅ cria reserva válida
    ❌ conflito de horário retorna 409
    ❌ fim antes do início retorna 400
    ❌ sala inexistente retorna 404
    ❌ campos obrigatórios faltando retorna 400
  DELETE /api/reservas/:id
    ✅ admin cancela reserva com sucesso
    ❌ usuário comum não pode cancelar (403)
    ❌ cancelar reserva já cancelada retorna 400
    ❌ reserva inexistente retorna 404

Tests: 13 passed, 13 total
```

Os testes utilizam banco de dados **em memória** (SQLite `:memory:`), completamente isolado do banco de desenvolvimento.

---

## 🗄️ Modelo do Banco de Dados

```
usuarios
├── id          INTEGER PK
├── nome        TEXT
├── email       TEXT UNIQUE
├── senha       TEXT (bcrypt hash)
├── perfil      TEXT ('comum' | 'admin')
└── criado_em   TEXT

salas
├── id          INTEGER PK
├── nome        TEXT UNIQUE
├── capacidade  INTEGER
├── localizacao TEXT
└── ativa       INTEGER (1 | 0)

reservas
├── id                  INTEGER PK
├── sala_id             INTEGER FK → salas.id
├── usuario_id          INTEGER FK → usuarios.id
├── inicio              TEXT
├── fim                 TEXT
├── descricao           TEXT
├── status              TEXT ('ativa' | 'cancelada')
├── motivo_cancelamento TEXT
└── criado_em           TEXT
```

**Restrições:**
- `CHECK(fim > inicio)` — garante horário válido no banco
- `UNIQUE(sala_id, inicio, fim)` — previne duplicatas
- `FOREIGN KEYS ON` — integridade referencial ativada

---

## 🔒 Segurança

- Senhas armazenadas com **bcrypt** (fator 10)
- Autenticação via **JWT** com expiração de 8 horas
- Autorização por perfil verificada no **back-end** em cada requisição
- Token deve ser enviado no header: `Authorization: Bearer <token>`

---

## 🗺️ SDLC Aplicado

Este projeto foi desenvolvido seguindo as fases do **Software Development Life Cycle**:

| Fase                    | Entregável                                      |
|-------------------------|-------------------------------------------------|
| Levantamento de Requisitos | Requisitos funcionais e não funcionais listados |
| Análise                 | Modelagem do banco, definição de papéis         |
| Design                  | Esboço da interface e arquitetura em camadas    |
| Implementação           | Código fonte completo (etapas 1–5)              |
| Testes                  | Plano e execução de testes automatizados        |
| Manutenção              | Estrutura modular preparada para evoluções      |

---

## 💡 Próximos Passos

- [ ] Notificações por e-mail ao criar/cancelar reserva
- [ ] Paginação e filtros na listagem de reservas
- [ ] Tela de gerenciamento de salas pelo admin
- [ ] Migração do banco para PostgreSQL (produção)
- [ ] Deploy com Docker + CI/CD (GitHub Actions)

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte da disciplina de Desenvolvimento de Software.
