require('dotenv').config();
const criarApp = require('./app');

async function iniciar() {
  let db;

  if (process.env.DATABASE_URL) {
    // Produção — PostgreSQL
    db = require('./database/dbProd');
    await db.inicializar();
    await require('./database/seedProd').executar(db);
  } else {
    // Desenvolvimento — SQLite
    db = require('./database/db');
  }

  const app  = criarApp(db);
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
  });
}

iniciar();