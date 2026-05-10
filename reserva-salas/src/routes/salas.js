const express = require('express');
const router = express.Router();
const {listar, listarDisponiveis} = require('../controllers/salasController');
const {autenticar} = require('../middlewares/auth');

router.get('/', autenticar, listar);
router.get('/disponiveis', autenticar, listarDisponiveis);

module.exports = router;