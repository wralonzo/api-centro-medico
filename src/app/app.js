const logger = require('morgan');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(logger('dev'));

app.use(require('../controllers/UsuarioController'));
app.use(require('../controllers/PacienteController'));
app.use(require('../controllers/EspecialidadController'));
app.use(require('../controllers/MedicoController'));

module.exports = app;
