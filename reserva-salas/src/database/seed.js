require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('populando banco de dados...');

// Usuários

const usuarios = [
    {nome: 'Administrador', email: 'admin@salas.com', senha: 'admin123', perfil: 'admin'},
    {nome: 'João Silva', email: 'joao@salas.com', senha: 'joao123', perfil: 'comum'},
    {nome: 'Maria Souza', email: 'maria@salas.com', senha: 'maria123', perfil: 'comum'},
];

const insertUsuario = db.prepare(`
    INSERT OR IGNORE INTO usuarios (nome, email, senha, perfil)
    VALUES (@nome, @email, @senha, @perfil)
    `);


for (const u of usuarios) {
    u.senha = bcrypt.hashSync(u.senha, 10);
    insertUsuario.run(u);

}
console.log(' Usuários criados');

// Salas

const salas = [
    {nome: 'Sala A', capacidade: 10, localizacao: 'Bloco 1 - Térreo', },
    {nome: 'Sala B', capacidade: 20, localizacao: 'Bloco 1 - 1º andar', },
    {nome: 'Auditório', capacidade: 80, localizacao: 'Bloco 2 - Térreo', },
    {nome: 'Sala de Reuniões', capacidade: 8, localizacao: 'Bloco 2 - 2º andar', },
];

const insertSala = db.prepare(`
    INSERT OR IGNORE INTO salas (nome, capacidade, localizacao)
    VALUES (@nome, @capacidade, @localizacao)
    `);

for (const s of salas) insertSala.run(s);
console.log(' Salas criadas ');

console.log('\n Seed concluido! Credenciais de acesso');
console.log(' Admin: admin@salas.com / admin123');
console.log(' Usuário: joao@salas.com / joao123');

