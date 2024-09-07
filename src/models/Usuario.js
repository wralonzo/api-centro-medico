const bcrypt = require('bcryptjs');
const database = require('../database/database');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(database.DB_NAME, database.DB_USER, database.DB_PASSWORD, {
  host: database.DB_HOST,
  port: database.DB_PORT,
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => console.log('Conexión establecida con la base de datos.'))
  .catch(error => console.error('Error al conectar con la base de datos: ', error));

const Usuario = sequelize.define('usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(8),
    allowNull: false
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dpi: {
    type: DataTypes.STRING(13),
    allowNull: false
  },
  correo_electronico: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  contrasenia: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('SUPER_ADMINISTRADOR', 'MEDICO', 'SECRETARIA'),
    allowNull: false
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  freezeTableName: true,
  hooks: {
    beforeCreate: async (usuario) => {
      const salt = await bcrypt.genSalt();
      usuario.contrasenia = await bcrypt.hash(usuario.contrasenia, salt);
    }
  }
});

sequelize.sync()
  .then(() => console.log('Tabla usuario creada'))
  .catch(error => console.error('Error', error));

module.exports = Usuario;
