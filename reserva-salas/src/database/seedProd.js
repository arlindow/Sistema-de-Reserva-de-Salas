const bcrypt = require('bcryptjs');

async function executar(db) {
  // Verifica se já existe algum usuário
  const existe = await db.prepare('SELECT id FROM usuarios LIMIT 1').get();
  if (existe) return; // já populado, não faz nada

  console.log('🌱 Populando banco de produção...');

  const hash = bcrypt.hashSync('admin123', 10);
  await db.prepare(
    'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1,$2,$3,$4)'
  ).run('Administrador', 'admin@salas.com', hash, 'admin');

  await db.prepare(
    'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1,$2,$3,$4)'
  ).run('João Silva', 'joao@salas.com', bcrypt.hashSync('joao123', 10), 'comum');

  const salas = [
    ['Sala A', 10, 'Bloco 1 - Térreo'],
    ['Sala B', 20, 'Bloco 1 - 1º Andar'],
    ['Auditório', 80, 'Bloco 2 - Térreo'],
    ['Sala Reuniões', 8, 'Bloco 2 - 2º Andar'],
  ];

  for (const [nome, cap, loc] of salas) {
    await db.prepare(
      'INSERT INTO salas (nome, capacidade, localizacao) VALUES ($1,$2,$3)'
    ).run(nome, cap, loc);
  }

  console.log('✅ Seed de produção concluído');
}

module.exports = { executar };