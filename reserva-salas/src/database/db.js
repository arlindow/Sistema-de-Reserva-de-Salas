const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database.sqlite'));

// Ativa chaves estrangeiras

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Tabelas

db.exec(`
    
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        perfil TEXT NOT NULL DEFAULT 'comum' CHECK(perfil IN ('comum', 'admin')),
        criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS salas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        capacidade INTEGER NOT NULL,
        localizacao TEXT NOT NULL,
        ativa INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sala_id INTEGER NOT NULL REFERENCES salas(id),
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
        inicio TEXT NOT NULL,
        fim TEXT NOT NULL, 
        descricao TEXT,
        status TEXT NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa', 'cancelada')),
        motivo_cancelamento TEXT,
        criado_em TEXT NOT NULL DEFAULT (datetime('now')),
        CHECK(fim > inicio)   
    );
    
    `);


console.log(' Banco de Dados pronto');

module.exports = db;

