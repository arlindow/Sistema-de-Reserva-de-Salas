const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');

function criarBancoDeTeste() {
  const db = new Database(':memory:'); // banco em memória, descartado após o teste

  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE,
      senha     TEXT    NOT NULL,
      perfil    TEXT    NOT NULL DEFAULT 'comum' CHECK(perfil IN ('comum','admin')),
      criado_em TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE salas (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT    NOT NULL UNIQUE,
      capacidade  INTEGER NOT NULL,
      localizacao TEXT    NOT NULL,
      ativa       INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE reservas (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      sala_id             INTEGER NOT NULL REFERENCES salas(id),
      usuario_id          INTEGER NOT NULL REFERENCES usuarios(id),
      inicio              TEXT    NOT NULL,
      fim                 TEXT    NOT NULL,
      descricao           TEXT,
      status              TEXT    NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa','cancelada')),
      motivo_cancelamento TEXT,
      criado_em           TEXT    NOT NULL DEFAULT (datetime('now')),
      CHECK(fim > inicio)
    );
  `);

  // Usuários de teste
  const hash = bcrypt.hashSync('senha123', 10);
  db.prepare(`INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?,?,?,?)`)
    .run('Admin Teste',   'admin@teste.com', hash, 'admin');
  db.prepare(`INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?,?,?,?)`)
    .run('Usuário Teste', 'user@teste.com',  hash, 'comum');

  // Salas de teste
  db.prepare(`INSERT INTO salas (nome, capacidade, localizacao) VALUES (?,?,?)`)
    .run('Sala 1', 10, 'Bloco A');
  db.prepare(`INSERT INTO salas (nome, capacidade, localizacao) VALUES (?,?,?)`)
    .run('Sala 2', 20, 'Bloco B');

  return db;
}

module.exports = criarBancoDeTeste;