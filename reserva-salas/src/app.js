const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do front end
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
//
//
//

module.exports = app;
