const { Router } = require('express');

const router = Router();

const Medico = require('../models/Medico');
const Usuario = require('../models/Usuario');
const Especialidad = require('../models/Especialidad');
const verifyToken = require('./VerifyToken');

// ENDPOINT - REGISTER 
router.post('/doctor/register', verifyToken, async (req, res, next) => {
  try {
    const {
      medico_id,
      especialidad_id
    } = req.body;
    const nuevoMedico = await Medico.create({
      medico_id,
      especialidad_id
    });
    res.status(201).json(nuevoMedico);
  } catch (error) {
    console.error('Error al registrar medico:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - UPDATE
router.put('/doctor/update/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const {
      especialidad_id
    } = req.body;
    const medico = await Medico.findByPk(id);
    if (!medico) {
      return res.status(404).send('Medico no encontrado');
    }
    const medicoActualizado = await Medico.update({
      especialidad_id
    }, {
      where: { id: id }
    });
    res.status(200).json(medicoActualizado);
  } catch (error) {
    console.error('Error al actualizar medico:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - UPDATE
router.delete('/doctor/delete/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const medicoEliminado = await Medico.findByPk(id);
    if (!medicoEliminado) {
      return res.status(404).send('Medico no encontrado');
    }
    if (!medicoEliminado.estado) {
      return res.status(400).send('El medico ya ha sido dado de baja');
    }
    await medicoEliminado.update({ estado: false });
    return res.status(200).json(medicoEliminado);
  } catch (error) {
    console.error('Error al eliminar medico:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - LIST
router.get('/doctor/list', verifyToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10
    } = req.query;
    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;
    const totalMedicos = await Medico.count({
      where: { estado: true }
    });
    const medicos = await Medico.findAll({
      where: { estado: true },
      limit: numericLimit,
      offset: offset,
      include: [
        {
          model: Usuario,
          attributes: [
            'nombre',
            'apellido',
            'direccion',
            'telefono',
            'fecha_nacimiento',
            'dpi'
          ]
        },
        {
          model: Especialidad,
          attributes: ['nombre']
        }
      ]
    });
    const totalPages = Math.ceil(totalMedicos / limit);
    res.json({
      totalMedicos: totalMedicos,
      totalPages: totalPages,
      currentPage: parseInt(page),
      medicos: medicos
    });
  } catch (error) {
    console.error('Error al obtener el listado de medicos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ENDPOINT - FIND_BY_ID
router.get('/doctor/:id', verifyToken, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const medico = await Medico.findByPk(id);
    if (!medico) {
      return res.status(404).send('Medico no encontrado');
    }
    if (!medico.estado) {
      return res.status(404).send('Medico no encontrado');
    }
    res.status(200).json(medico);
  } catch (error) {
    console.error('Error al obtener el medico por ID:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = router; 
