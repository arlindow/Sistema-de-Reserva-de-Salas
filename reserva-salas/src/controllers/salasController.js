const db = require('../database/db');

function listar(req,res) {
    const salas = db.prepare('SELECT * FROM salas WHERE ativa = 1').all();
    return res.json(salas);
}

function listarDisponiveis(req,res) {
    const {inicio, fim} = req.query;

    if (!inicio || !fim) {
        return res.status(400).json({erro: 'Informe inicio e fim para verificar disponibilidade'});
    }

    if (fim <= inicio) {
        return res.status(400).json({erro: 'O horário de fim deve ser maior que o de inicio'});
    }

    // Busca salas que não tem reserva ativa no período informado
    const salas = db.prepare(`
        SELECT * FROM salas
        WHERE ativa = 1
        AND id NOT IN (
            SELECT sala_id FROM reservas
            WHERE status = 'ativa'
                AND inicio < ?
                AND fim > ?
        )
        `).all(fim,inicio);

        return res.json(salas);
}

module.exports = {listar, listarDisponiveis};