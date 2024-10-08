const { Router } = require("express");
const router = Router();
const verifyToken = require("./VerifyToken");
const Productos = require("../models/Productos");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const PDFDocument = require("pdfkit");

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

router.get("/producto/generate/pdf", async (req, res, next) => {
  // Crea un nuevo documento PDF
  const doc = new PDFDocument({ margin: 30 });

  // Configura los encabezados para mostrar el PDF en el navegador
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "inline; filename=reporte_productos.pdf"
  );

  // Enviar el documento directamente a la respuesta
  doc.pipe(res);

  // Título del reporte
  doc.fontSize(20).text("Reporte de Productos", { align: "center" });
  doc.moveDown(2); // Espacio después del título

  try {
    // Obtén los productos de la base de datos
    const productos = await Productos.findAll({
      where: { estado: true },
    });

    // Definir encabezados de la tabla
    const tableTop = 100;
    const itemHeight = 20;

    // Dibujar encabezados de la tabla
    doc.fontSize(10);
    doc.text("ID", 50, tableTop);
    doc.text("Nombre", 75, tableTop);
    doc.text("Precio", 200, tableTop);
    doc.text("Existencia", 300, tableTop);
    doc.text("Fecha de Vencimiento", 375, tableTop);
    doc.text("Estado", 500, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Dibujar los datos de los productos en la tabla
    let position = tableTop + 30;
    productos.forEach((producto) => {
      doc.text(producto.id, 50, position);
      doc.text(producto.nombre, 75, position);
      doc.text(`Q${producto.precio}`, 200, position);
      doc.text(producto.existencia, 300, position);
      doc.text(producto.fechaVencimiento.toDateString(), 375, position);
      doc.text(producto.estado ? "Activo" : "Inactivo", 500, position);

      // Dibujar línea separadora entre filas
      doc
        .moveTo(50, position + 15)
        .lineTo(550, position + 15)
        .stroke();

      position += itemHeight; // Incrementar posición para la siguiente fila
    });

    // Finaliza el documento
    doc.end();
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).send("Error al generar el reporte.");
  }
});

module.exports = router;
