const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

function login(req, res) {
    const {email, senha} = req.body;

    if (!email || !senha) {
        return res.status(400).json({erro: 'email e senha são obrigatorios'});
    }
    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

    if (!usuario) {
        return res.status(401).json({erro: 'Credenciais inválidas'});
    }

    // Gera token JWT (expira em 8 horas)
    const token = jwt.sign(
        {id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil},
        process.env.JWT_SECRET,
        {expiresIn: '8h'}
    );

    return res.json({
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
        },
    });

}

function perfil(req, res) {
    //req.usuario já vem preenchido pelo middleware autenticar
    return res.json({usuario: req.usuario});
}

module.exports = {login, perfil};