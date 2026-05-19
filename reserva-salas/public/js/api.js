// antes
//const API = 'https://turbo-carnival-v9g7pvv5rp9hqpj-3000.app.github.dev/api'; //http://localhost:3000/api

// Depois: Troque a URL fixa pela URL dinâmica (Railway gera uma URL própria):

const API = window.location.origin + '/api';


function getToken() {
  return localStorage.getItem('token');
}

function getUsuario() {
  return JSON.parse(localStorage.getItem('usuario') || 'null');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro inesperado');
  return data;
}

// Atalhos
const api = {
  login:               (email, senha)        => request('POST', '/auth/login', { email, senha }),
  salas:               ()                    => request('GET',  '/salas'),
  salasDisponiveis:    (inicio, fim)          => request('GET',  `/salas/disponiveis?inicio=${inicio}&fim=${fim}`),
  reservas:            ()                    => request('GET',  '/reservas'),
  criarReserva:        (dados)               => request('POST', '/reservas', dados),
  cancelarReserva:     (id, motivo)          => request('DELETE', `/reservas/${id}`, { motivo_cancelamento: motivo }),
};