const { Router } = require('express');

const router = Router();

const Especialidad = require('../models/Especialidad');
const verifyToken = require('./VerifyToken');

// ENDPOINT - REGISTER 
router.post('/specialty/register', verifyToken, async (req, res, next) => {
  try {
    const {
      nombre
    } = req.body;
    const nuevaEspecialidad = await Especialidad.create({
      nombre
    });
    res.status(201).json(nuevaEspecialidad);
  } catch (error) {
    console.error('Error al registrar especialidad:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - UPDATE
router.put('/specialty/update/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const {
      nombre
    } = req.body;
    const especialidad = await Especialidad.findByPk(id);
    if (!especialidad) {
      return res.status(404).send('Especialidad no encontrada');
    }
    const especialidadActualizada = await Especialidad.update({
      nombre
    }, {
      where: { id: id }
    });
    res.status(200).json(especialidadActualizada);
  } catch (error) {
    console.error('Error al actualizar especialidad:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - UPDATE
router.delete('/specialty/delete/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const especialidadEliminada = await Especialidad.findByPk(id);
    if (!especialidadEliminada) {
      return res.status(404).send('Especialidad no encontrada');
    }
    if (!especialidadEliminada.estado) {
      return res.status(400).send('La especialidad ya ha sido dada de baja');
    }
    await especialidadEliminada.update({ estado: false });
    return res.status(200).json(especialidadEliminada);
  } catch (error) {
    console.error('Error al eliminar especialidad:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - LIST - PAGE
router.get('/specialty/list', verifyToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query;
    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;
    const totalEspecialidades = await Especialidad.count({
      where: { estado: true }
    });
    const especialidades = await Especialidad.findAll({
      where: { estado: true },
      limit: numericLimit,
      offset: offset
    });
    const totalPages = Math.ceil(totalEspecialidades / limit);
    res.json({
      totalEspecialidades: totalEspecialidades,
      totalPages: totalPages,
      currentPage: parseInt(page),
      especialidades: especialidades
    });
  } catch (error) {
    console.error('Error al obtener el listado de especialidades:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - LIST ALL 
router.get('/specialty/list-all', verifyToken, async (req, res, next) => {
  try {
    const especialidades = await Especialidad.findAll({
      where: { estado: true }
    });
    res.status(200).json(especialidades);
  } catch (error) {
    console.error('Error al obtener el listado de especialidades:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - FIND_BY_ID
router.get('/specialty/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const paciente = await Especialidad.findByPk(id);
    if (!paciente.estado) {
      return res.status(404).send('Especialidad no encontrada');
    }
    res.status(200).json(paciente);
  } catch (error) {
    console.error('Error al obtener la especialidad por ID:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router; 
