const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Router } = require('express');
const router = Router();

const Usuario = require('../models/Usuario');
const verifyToken = require('./VerifyToken');

// ENDPOINT - REGISTER
router.post('/user/register', async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      direccion,
      telefono,
      fecha_nacimiento,
      dpi,
      correo_electronico,
      contrasenia,
      rol
    } = req.body;
    const usuario = new Usuario({
      nombre: nombre,
      apellido: apellido,
      direccion: direccion,
      telefono: telefono,
      fecha_nacimiento: fecha_nacimiento,
      dpi: dpi,
      correo_electronico: correo_electronico,
      contrasenia: contrasenia,
      rol: rol
    });
    await usuario.save();
    const token = jwt.sign({
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    }, config.secret, {
      expiresIn: 60 * 60 * 24
    });
    res.json({
      auth: true,
      token: token
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - LOGIN
router.post('/user/login', async (req, res, next) => {
  try {
    const { correo_electronico, contrasenia } = req.body;
    const usuario = await Usuario.findOne({
      where: {
        correo_electronico: correo_electronico,
        estado: true
      }
    });
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado o no activo');
    }
    const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    if (!contraseniaValida) {
      return res.status(401).json({
        auth: false,
        token: null
      });
    }
    const token = jwt.sign({
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido
    }, config.secret, {
      expiresIn: 60 * 60 * 24
    });
    res.json({
      auth: true,
      token: token
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - UPDATE
router.put('/user/update/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      direccion,
      telefono,
      fecha_nacimiento,
      dpi,
      correo_electronico,
      contrasenia,
      rol
    } = req.body;
    const { id } = req.params;
    let usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }
    if (contrasenia) {
      const salt = await bcrypt.genSalt();
      const hashedContrasenia = await bcrypt.hash(contrasenia, salt);
      await usuario.update({
        nombre,
        apellido,
        direccion,
        telefono,
        fecha_nacimiento,
        dpi,
        correo_electronico,
        contrasenia: hashedContrasenia,
        rol
      });
    } else {
      await usuario.update({
        nombre,
        apellido,
        direccion,
        telefono,
        fecha_nacimiento,
        dpi,
        correo_electronico,
        rol
      });
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - DELETE
router.delete('/user/delete/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioEliminado = await Usuario.findByPk(id);
    await usuarioEliminado.update({ estado: false });
    res.status(200).json(usuarioEliminado);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - LIST - PAGE
router.get('/user/list', verifyToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;
    const totalUsuarios = await Usuario.count({ where: { estado: true } });
    const usuarios = await Usuario.findAll({
      where: { estado: true },
      attributes: { exclude: ['contrasenia'] },
      limit: numericLimit,
      offset: offset
    });
    const totalPages = Math.ceil(totalUsuarios / limit);
    res.json({
      totalUsuarios: totalUsuarios,
      totalPages: totalPages,
      currentPage: parseInt(page),
      usuarios: usuarios
    });
  } catch (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - LIST - PAGE
router.get('/user/list-all-rol-doctor', verifyToken, async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { 
        estado: true, 
        rol: 'MEDICO' 
      },
      attributes: { exclude: ['contrasenia'] },
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - FIND_BY_ID
router.get('/user/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      where: { estado: true },
      attributes: { exclude: ['contrasenia'] }
    });
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener el usuario por ID:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router;
