//const db = require('../database/db');

//Lista reservas
//Admin vê todas, comum vÊ só as suas
function listar(req, res) {
    const {id, perfil} = req.usuario;

    const reservas = perfil === 'admin'
        ? req.db.prepare(`
            SELECT r.*, s.nome AS sala_nome, u.nome AS usuario_nome
            FROM reservas r
            JOIN salas s ON s.id = r.sala_id
            JOIN usuarios u ON u.id = r.usuario_id
            ORDER BY r.inicio DESC
          `).all()
        : req.db.prepare(`
            SELECT r.*, s.nome AS sala_nome, u.nome AS usuario_nome
            FROM reservas r
            JOIN salas s ON s.id = r.sala_id
            JOIN usuarios u ON u.id = r.usuario_id
            WHERE r.usuario_id = ? 
            ORDER BY r.inicio DESC
          `).all(id);

    return res.json(reservas);
}

// Cria nova reserva
function criar(req, res) {
  // ✅ Converte explicitamente para número
  const sala_id    = Number(req.body.sala_id);
  const { inicio, fim, descricao } = req.body;
  const usuario_id = req.usuario.id;

  if (!sala_id || !inicio || !fim)
    return res.status(400).json({ erro: 'sala_id, inicio e fim são obrigatórios' });

  if (fim <= inicio)
    return res.status(400).json({ erro: 'O horário de fim deve ser maior que o de início' });

  const sala = req.db.prepare('SELECT * FROM salas WHERE id = ? AND ativa = 1').get(sala_id);
  if (!sala)
    return res.status(404).json({ erro: 'Sala não encontrada ou inativa' });

  const conflito = req.db.prepare(`
    SELECT id FROM reservas
    WHERE sala_id = ? AND status = 'ativa' AND inicio < ? AND fim > ?
  `).get(sala_id, fim, inicio);

  if (conflito)
    return res.status(409).json({ erro: 'Já existe uma reserva para esta sala neste horário' });

  const resultado = req.db.prepare(`
    INSERT INTO reservas (sala_id, usuario_id, inicio, fim, descricao)
    VALUES (?, ?, ?, ?, ?)
  `).run(sala_id, usuario_id, inicio, fim, descricao || null);

  const novaReserva = req.db.prepare('SELECT * FROM reservas WHERE id = ?')
    .get(resultado.lastInsertRowid);

  return res.status(201).json(novaReserva);
}

// Cancela reserva (apenas admin)
function cancelar(req,res) {
    const {id} = req.params;
    const {motivo_cancelamento} = req.body;

    const reserva = req.db.prepare('SELECT * FROM reservas WHERE id = ?').get(id);

    if (!reserva) {
        return res.status(404).json({erro: 'Reserva não encontrada'});
    }

    if (reserva.status === 'cancelada') {
        return res.status(400).json({erro: 'Esta reserva já foi cancelada'});
    }

    req.db.prepare(`
        UPDATE reservas
        SET status = 'cancelada', motivo_cancelamento = ?
        WHERE id = ?
     `).run(motivo_cancelamento || 'Cancelado pelo administrador', id);
    
    return res.json({mensagem: 'Reserva cancelada com sucesso'});

}

module.exports = {listar, criar, cancelar};