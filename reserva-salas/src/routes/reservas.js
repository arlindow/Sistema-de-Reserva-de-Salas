const express = require('express');
const router = express.Router();
const {listar, criar, cancelar} = require('../controllers/reservasController');
const {autenticar, apenasAdmin} = require('../middlewares/auth');

router.get('/', autenticar, listar);
router.post('/', autenticar, criar);
router.delete('/:id', autenticar, apenasAdmin, cancelar);

module.exports = router;