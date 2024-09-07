const database = require("../database/database");
const { Sequelize, DataTypes, ENUM } = require("sequelize");

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

const Paciente = require("./Paciente");
const Medico = require("./Medico");

sequelize
  .authenticate()
  .then(() => console.log("Conexión establecida con la base de datos."))
  .catch((error) =>
    console.error("Error al conectar con la base de datos: ", error)
  );

const Cita = sequelize.define(
  "cita",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    paciente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Paciente,
        key: "id",
      },
    },
    medico_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Medico,
        key: "id",
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_entrada: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    hora_salida: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    nota: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("CONFIRMADA", "PENDIENTE", "CANCELADA"),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Cita.belongsTo(Paciente, { foreignKey: "paciente_id" });
Cita.belongsTo(Medico, { foreignKey: "medico_id" });

sequelize
  .sync()
  .then(() => console.log("Tabla cita creada"))
  .catch((error) => console.error("Error", error));

module.exports = Cita;
