const { Router } = require("express");

const router = Router();

const verifyToken = require("./VerifyToken");
const Cita = require("../models/Cita");

// ENDPOINT - REGISTER
router.post("/cita/register", async (req, res, next) => {
  try {
    const payload = req.body;
    console.log(payload);
    const requeste = await Cita.create(payload);
    res.status(201).json(requeste);
  } catch (error) {
    console.error("Error al registrar la cita:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ENDPOINT - UPDATE
router.put("/cita/update/:id", async (req, res, next) => {
  try {
    const payload = req.body;
    const param = req.params;
    const cita = await Cita.findByPk(param.id);
    if (!cita) {
      return res.status(404).send("Cita no encontrado");
    }
    const citaUpdate = await Cita.update(payload, {
      where: { id: param.id },
    });
    res.status(200).json(citaUpdate);
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ENDPOINT - UPDATE
router.delete("/cita/delete/:id", async (req, res, next) => {
  try {
    const param = req.params;
    const citaEliminada = await Cita.findByPk(param.id);
    if (!citaEliminada) {
      return res.status(404).send("Cita no encontrado");
    }
    if (!citaEliminada.delete) {
      return res.status(400).send("la ya ha sido dado de baja");
    }
    const pacienteEliminado = await citaEliminada.update({ delete: 0 });
    return res.status(200).json(pacienteEliminado);
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ENDPOINT - LIST
router.get("/cita", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;
    const totalPacientes = await Cita.count({
      where: { estado: true },
    });
    const pacientes = await Cita.findAll({
      where: { delete: 1 },
      limit: numericLimit,
      offset: offset,
    });
    const totalPages = Math.ceil(totalPacientes / limit);
    res.json({
      totalPacientes: totalPacientes,
      totalPages: totalPages,
      currentPage: parseInt(page),
      pacientes: pacientes,
    });
  } catch (error) {
    console.error("Error al obtener el listado de pacientes:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ENDPOINT - FIND_BY_ID
router.get("/cita/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const paciente = await Cita.findByPk(id);
    if (!paciente.estado) {
      return res.status(404).send("Paciente no encontrado");
    }
    res.status(200).json(paciente);
  } catch (error) {
    console.error("Error al obtener el paciente por ID:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
