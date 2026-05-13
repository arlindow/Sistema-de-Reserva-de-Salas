require('dotenv').config();
const request        = require('supertest');
const criarApp       = require('../src/app');
const criarBancoDeTeste = require('../src/database/dbTeste');

let app, db;

beforeEach(() => {
  db  = criarBancoDeTeste();
  app = criarApp(db);
});

afterEach(() => db.close());

describe('POST /api/auth/login', () => {

  test('✅ login com credenciais válidas retorna token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.com', senha: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.perfil).toBe('admin');
  });

  test('❌ senha errada retorna 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.com', senha: 'errada' });

    expect(res.status).toBe(401);
    expect(res.body.erro).toBe('Credenciais inválidas');
  });

  test('❌ email inexistente retorna 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'naoexiste@teste.com', senha: 'senha123' });

    expect(res.status).toBe(401);
  });

  test('❌ campos vazios retornam 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });

});