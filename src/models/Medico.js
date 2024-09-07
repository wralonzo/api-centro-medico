const database = require('../database/database');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(database.DB_NAME, database.DB_USER, database.DB_PASSWORD, {
  host: database.DB_HOST,
  port: database.DB_PORT,
  dialect: 'mysql'
});

const Usuario = require('./Usuario');
const Especialidad = require('./Especialidad');

sequelize.authenticate()
  .then(() => console.log('Conexión establecida con la base de datos.'))
  .catch(error => console.error('Error al conectar con la base de datos: ', error));

const Medico = sequelize.define('medico', {
  medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  especialidad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Especialidad,
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  freezeTableName: true
});

Medico.belongsTo(Usuario, { foreignKey: 'medico_id' });
Medico.belongsTo(Especialidad, { foreignKey: 'especialidad_id' });

sequelize.sync()
  .then(() => console.log('Tabla medico creada'))
  .catch(error => console.error('Error', error));

module.exports = Medico; 
