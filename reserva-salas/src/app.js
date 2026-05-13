const express = require('express');
const cors    = require('cors');
const path    = require('path');

function criarApp(dbInjetado) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));

  // Injeta o banco nas rotas (real ou de teste)
  app.use((req, res, next) => {
    req.db = dbInjetado || require('./database/db');
    next();
  });

  app.use('/api/auth',     require('./routes/auth'));
  app.use('/api/salas',    require('./routes/salas'));
  app.use('/api/reservas', require('./routes/reservas'));

  return app;
}

module.exports = criarApp;