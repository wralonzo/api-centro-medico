const { Router } = require("express");
const router = Router();
const verifyToken = require("./VerifyToken");
const Productos = require("../models/Productos");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

router.post("/producto/register", async (req, res, next) => {
  try {
    console.log(req.body);

    const payload = req.body;
    const requeste = await Productos.create(payload);
    res.status(201).json(requeste);
  } catch (error) {
    console.error("Error al registrar la ficha:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ENDPOINT - UPDATE
router.put("/producto/update/:id", async (req, res, next) => {
  try {
    const payload = req.body;
    const param = req.params;
    const cita = await Productos.findByPk(param.id);
    if (!cita) {
      return res.status(404).send("Cita no encontrado");
    }
    const updateData = await Productos.update(payload, {
      where: { id: param.id },
    });
    res.status(200).json(updateData);
  } catch (error) {
    console.error("Error al actualizar prodcto:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ENDPOINT - UPDATE
router.delete("/producto/delete/:id", async (req, res, next) => {
  try {
    const param = req.params;
    const producto = await Productos.findByPk(param.id);
    if (!producto) {
      return res.status(404).send("Cita no encontrado");
    }
    if (!producto.estado) {
      return res.status(400).send(" ya ha sido dado de baja");
    }
    const pacienteEliminado = await producto.update({ estado: false });
    return res.status(200).json(pacienteEliminado);
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// ENDPOINT - LIST
router.get("/producto", async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const numericLimit = parseInt(limit, 10);
    const numericPage = parseInt(page, 10);
    const offset = (numericPage - 1) * numericLimit;
    const totalPacientes = await Productos.count({
      where: { estado: true },
    });
    const pacientes = await Productos.findAll({
      where: { estado: true },
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
router.get("/producto/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const paciente = await Productos.findByPk(id);
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
