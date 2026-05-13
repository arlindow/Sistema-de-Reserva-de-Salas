require('dotenv').config();
const request           = require('supertest');
const criarApp          = require('../src/app');
const criarBancoDeTeste = require('../src/database/dbTeste');

let app, db, tokenAdmin, tokenUser;

beforeEach(async () => {
  db  = criarBancoDeTeste();
  app = criarApp(db);

  // Login admin
  const resAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@teste.com', senha: 'senha123' });
  tokenAdmin = resAdmin.body.token;

  // Login usuário comum
  const resUser = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@teste.com', senha: 'senha123' });
  tokenUser = resUser.body.token;
});

afterEach(() => db.close());

// ── Salas ─────────────────────────────────────────────
describe('GET /api/salas', () => {

  test('✅ retorna lista de salas autenticado', async () => {
    const res = await request(app)
      .get('/api/salas')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('❌ sem token retorna 401', async () => {
    const res = await request(app).get('/api/salas');
    expect(res.status).toBe(401);
  });

});

// ── Criar reserva ─────────────────────────────────────
describe('POST /api/reservas', () => {

  test('✅ cria reserva válida', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        sala_id:   1,
        inicio:    '2025-06-01T09:00:00',
        fim:       '2025-06-01T10:00:00',
        descricao: 'Reunião de teste',
      });

    expect(res.status).toBe(201);
    expect(res.body.sala_id).toBe(1);
    expect(res.body.status).toBe('ativa');
  });

  test('❌ conflito de horário retorna 409', async () => {
    const reserva = {
      sala_id: 1,
      inicio:  '2025-06-01T09:00:00',
      fim:     '2025-06-01T10:00:00',
    };

    await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send(reserva);

    // Segunda reserva no mesmo horário
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(reserva);

    expect(res.status).toBe(409);
    expect(res.body.erro).toMatch(/conflito|reserva/i);
  });

  test('❌ fim antes do início retorna 400', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        sala_id: 1,
        inicio:  '2025-06-01T10:00:00',
        fim:     '2025-06-01T09:00:00',
      });

    expect(res.status).toBe(400);
  });

  test('❌ sala inexistente retorna 404', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        sala_id: 999,
        inicio:  '2025-06-01T09:00:00',
        fim:     '2025-06-01T10:00:00',
      });

    expect(res.status).toBe(404);
  });

  test('❌ campos obrigatórios faltando retorna 400', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ sala_id: 1 });

    expect(res.status).toBe(400);
  });

});

// ── Cancelar reserva ──────────────────────────────────
describe('DELETE /api/reservas/:id', () => {

  let idReserva;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        sala_id: 1,
        inicio:  '2025-06-01T14:00:00',
        fim:     '2025-06-01T15:00:00',
      });
    idReserva = res.body.id;
  });

  test('✅ admin cancela reserva com sucesso', async () => {
    const res = await request(app)
      .delete(`/api/reservas/${idReserva}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo_cancelamento: 'Teste de cancelamento' });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toMatch(/sucesso/i);
  });

  test('❌ usuário comum não pode cancelar (403)', async () => {
    const res = await request(app)
      .delete(`/api/reservas/${idReserva}`)
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ motivo_cancelamento: 'Tentativa indevida' });

    expect(res.status).toBe(403);
  });

  test('❌ cancelar reserva já cancelada retorna 400', async () => {
    // Cancela primeira vez
    await request(app)
      .delete(`/api/reservas/${idReserva}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo_cancelamento: 'Primeiro cancelamento' });

    // Tenta cancelar de novo
    const res = await request(app)
      .delete(`/api/reservas/${idReserva}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo_cancelamento: 'Segundo cancelamento' });

    expect(res.status).toBe(400);
  });

  test('❌ reserva inexistente retorna 404', async () => {
    const res = await request(app)
      .delete('/api/reservas/9999')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ motivo_cancelamento: 'Não existe' });

    expect(res.status).toBe(404);
  });

});