const database = require("../database/database");
const { Sequelize, DataTypes } = require("sequelize");

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

sequelize
  .authenticate()
  .then(() => console.log("Conexión establecida con la base de datos."))
  .catch((error) =>
    console.error("Error al conectar con la base de datos: ", error)
  );

const Productos = sequelize.define(
  "producto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    precio: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    existencia: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

sequelize
  .sync()
  .then(() => console.log("Tabla productos creada"))
  .catch((error) => console.error("Error", error));

module.exports = Productos;
