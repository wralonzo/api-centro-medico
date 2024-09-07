const database = require('../database/database');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(database.DB_NAME, database.DB_USER, database.DB_PASSWORD, {
  host: database.DB_HOST,
  port: database.DB_PORT,
  dialect: 'mysql'
});

const Ficha = require('./Ficha');

sequelize.authenticate()
  .then(() => console.log('Conexión establecida con la base de datos.'))
  .catch(error => console.error('Error al conectar con la base de datos: ', error));

const Historial = sequelize.define('historial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ficha_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ficha,
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tratamiento: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  freezeTableName: true,
}
);

Historial.belongsTo(Ficha, { foreignKey: 'ficha_id' });

sequelize.sync()
  .then(() => console.log('Tabla historial creada'))
  .catch(error => console.error('Error', error));

module.exports = Historial;
