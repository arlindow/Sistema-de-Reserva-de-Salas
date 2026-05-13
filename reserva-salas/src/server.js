require('dotenv').config();
const criarApp = require('./app');

const app  = criarApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});