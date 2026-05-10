const express = require('express');
const router = express.Router();
const {login, perfil} = require('../controllers/authController');
const {autenticar} = require('../middlewares/auth');

router.post('/login', login);
router.get('/perfil', autenticar, perfil); // rota protegida

module.exports = router;