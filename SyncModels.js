const { Sequelize } = require("sequelize");
const database = require("./src/database/database");

const sequelize = new Sequelize(
  database.DB_NAME,
  database.DB_USER,
  database.DB_PASSWORD,
  {
    host: database.DB_HOST,
    port: database.DB_PORT,
    dialect: "mysql",
  }
);

const Usuario = require("./src/models/Usuario");
const Paciente = require("./src/models/Paciente");
const Especialidad = require("./src/models/Especialidad");
const Medico = require("./src/models/Medico");
const Cita = require("./src/models/Cita");
const Ficha = require("./src/models/Ficha");
const Historial = require("./src/models/Historial");
const Productos = require("./src/models/Productos");

sequelize
  .sync()
  .then(() => console.log(""))
  .catch((error) => console.error("Error al crear las tablas: ", error));
