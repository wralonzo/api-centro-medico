const { Router } = require('express');

const router = Router();

const Paciente = require('../models/Paciente');
const verifyToken = require('./VerifyToken');

// ENDPOINT - REGISTER 
router.post('/patient/register', verifyToken, async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      direccion,
      telefono,
      fecha_nacimiento,
      dpi
    } = req.body;
    const nuevoPaciente = await Paciente.create({
      nombre,
      apellido,
      direccion,
      telefono,
      fecha_nacimiento,
      dpi
    });
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - UPDATE
router.put('/patient/update/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const {
      nombre,
      apellido,
      direccion,
      telefono,
      fecha_nacimiento,
      dpi
    } = req.body;
    const paciente = await Paciente.findByPk(id);
    if (!paciente) {
      return res.status(404).send('Paciente no encontrado');
    }
    const pacienteActualizado = await Paciente.update({
      nombre,
      apellido,
      direccion,
      telefono,
      fecha_nacimiento,
      dpi
    }, {
      where: { id: id }
    });
    res.status(200).json(pacienteActualizado);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - UPDATE
router.delete('/patient/delete/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const pacienteEliminado = await Paciente.findByPk(id);
    if (!pacienteEliminado) {
      return res.status(404).send('Paciente no encontrado');
    }
    if (!pacienteEliminado.estado) {
      return res.status(400).send('El paciente ya ha sido dado de baja');
    }
    await pacienteEliminado.update({ estado: false });
    return res.status(200).json(pacienteEliminado);
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - LIST
router.get('/patient/list', verifyToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query;
    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;
    const totalPacientes = await Paciente.count({
      where: { estado: true }
    });
    const pacientes = await Paciente.findAll({
      where: { estado: true },
      limit: numericLimit,
      offset: offset
    });
    const totalPages = Math.ceil(totalPacientes / limit);
    res.json({
      totalPacientes: totalPacientes,
      totalPages: totalPages,
      currentPage: parseInt(page),
      pacientes: pacientes
    });
  } catch (error) {
    console.error('Error al obtener el listado de pacientes:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - FIND_BY_ID
router.get('/patient/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const paciente = await Paciente.findByPk(id);
    if (!paciente.estado) {
      return res.status(404).send('Paciente no encontrado');
    }
    res.status(200).json(paciente);
  } catch (error) {
    console.error('Error al obtener el paciente por ID:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router; 
