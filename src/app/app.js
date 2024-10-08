const logger = require("morgan");
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" })); // Increase JSON body limit if needed
app.use(bodyParser.text({ type: "/" }));
app.use(require("../controllers/UsuarioController"));
app.use(require("../controllers/PacienteController"));
app.use(require("../controllers/EspecialidadController"));
app.use(require("../controllers/MedicoController"));
app.use(require("../controllers/CitasController"));
app.use(require("../controllers/FichasController"));
app.use(require("../controllers/ProductoController"));

module.exports = app;
