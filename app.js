const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Simulando um banco de dados com uma lista em memória
let escalas = [];

// Rota para inscrição
app.post('/inscricao', (req, res) => {
  const { nome, evento } = req.body;
  escalas.push({ nome, evento });
  res.status(200).send('Inscrição realizada com sucesso');
});

// Rota para visualizar escalas
app.get('/escalas', (req, res) => {
  res.json(escalas);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
