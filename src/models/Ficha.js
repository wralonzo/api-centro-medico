const database = require('../database/database');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(database.DB_NAME, database.DB_USER, database.DB_PASSWORD, {
  host: database.DB_HOST,
  port: database.DB_PORT,
  dialect: 'mysql'
});

const Paciente = require('./Paciente');

sequelize.authenticate()
  .then(() => console.log('Conexión establecida con la base de datos.'))
  .catch(error => console.error('Error al conectar con la base de datos: ', error));

const Ficha = sequelize.define('ficha', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paciente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Paciente,
      key: 'id'
    }
  },
  pdf: {
    type: DataTypes.BLOB,
    allowNull: false
  },
  nota: {
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

Ficha.belongsTo(Paciente, { foreignKey: 'paciente_id' });

sequelize.sync()
  .then(() => console.log('Tabla ficha creada'))
  .catch(error => console.error('Error', error));

module.exports = Ficha;
