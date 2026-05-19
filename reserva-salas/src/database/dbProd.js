const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário no Railway
});

// Cria as tabelas se não existirem
async function inicializar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        SERIAL PRIMARY KEY,
      nome      TEXT NOT NULL,
      email     TEXT NOT NULL UNIQUE,
      senha     TEXT NOT NULL,
      perfil    TEXT NOT NULL DEFAULT 'comum' CHECK(perfil IN ('comum','admin')),
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS salas (
      id          SERIAL PRIMARY KEY,
      nome        TEXT NOT NULL UNIQUE,
      capacidade  INTEGER NOT NULL,
      localizacao TEXT NOT NULL,
      ativa       INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reservas (
      id                  SERIAL PRIMARY KEY,
      sala_id             INTEGER NOT NULL REFERENCES salas(id),
      usuario_id          INTEGER NOT NULL REFERENCES usuarios(id),
      inicio              TIMESTAMPTZ NOT NULL,
      fim                 TIMESTAMPTZ NOT NULL,
      descricao           TEXT,
      status              TEXT NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa','cancelada')),
      motivo_cancelamento TEXT,
      criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK(fim > inicio)
    );
  `);
  console.log('✅ Tabelas PostgreSQL prontas');
}

// Adapta a interface para ser compatível com o better-sqlite3
// (prepare + run/get/all → query assíncrona)
function prepare(sql) {
  return {
    run:  (...params) => pool.query(sql, params),
    get:  (...params) => pool.query(sql, params).then(r => r.rows[0] || null),
    all:  (...params) => pool.query(sql, params).then(r => r.rows),
  };
}

module.exports = { prepare, inicializar, pool };