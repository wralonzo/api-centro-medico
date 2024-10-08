const { Router } = require("express");

const router = Router();

const verifyToken = require("./VerifyToken");
const Cita = require("../models/Cita");
const Paciente = require("../models/Paciente");
const Medico = require("../models/Medico");
const Usuario = require("../models/Usuario");
const Especialidad = require("../models/Especialidad");
const PDFDocument = require("pdfkit");

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
function formatFechaEspanol(fecha) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(fecha);
}
router.get("/cita/paciente/pdf/:id", async (req, res, next) => {
  const pacienteId = req.params.id;

  // Crea un nuevo documento PDF
  const doc = new PDFDocument({ margin: 30 });

  // Configura los encabezados para mostrar el PDF en el navegador
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=reporte_citas_paciente_${pacienteId}.pdf`
  );

  // Enviar el documento directamente a la respuesta
  doc.pipe(res);

  try {
    // Obtén el paciente y sus citas de la base de datos
    const paciente = await Paciente.findByPk(pacienteId);
    const citas = await Cita.findAll({
      where: { paciente_id: pacienteId },
      include: [
        {
          model: Medico,
          include: [
            {
              model: Usuario,
              attributes: [
                "nombre",
                "apellido",
                "direccion",
                "telefono",
                "fecha_nacimiento",
                "dpi",
              ],
            },
            {
              model: Especialidad,
              attributes: ["nombre"],
            },
          ],
        },
      ],
    });

    // Título del reporte
    doc.fontSize(20).text(`Reporte de Citas - Paciente: ${paciente.nombre}`, {
      align: "center",
    });
    doc.moveDown(2); // Espacio después del título

    if (citas.length === 0) {
      doc.text("No hay citas registradas para este paciente.", {
        align: "center",
      });
    } else {
      // Definir encabezados de la tabla
      const tableTop = 150;
      const itemHeight = 20;

      // Dibujar encabezados de la tabla
      doc.fontSize(12);
      doc.text("ID", 40, tableTop);
      doc.text("Fecha", 75, tableTop);
      doc.text("Hora Entrada", 220, tableTop);
      doc.text("Hora Salida", 300, tableTop);
      doc.text("Médico", 400, tableTop);
      doc.text("Estado", 500, tableTop);

      doc
        .moveTo(40, tableTop + 15)
        .lineTo(575, tableTop + 15)
        .stroke();

      // Dibujar las citas en la tabla
      let position = tableTop + 30;
      citas.forEach((cita) => {
        doc.text(cita.id, 40, position);
        doc.text(formatFechaEspanol(cita.fecha), 65, position); // Convertir fecha a español
        doc.text(cita.hora_entrada, 220, position);
        doc.text(cita.hora_salida, 300, position);
        doc.text(
          `${cita.medico.usuario.nombre} ${cita.medico.usuario.apellido}`, // Acceso al nombre del médico desde el usuario
          400,
          position
        ); // Asume que el médico tiene un campo "nombre"
        doc.text(cita.estado, 500, position);

        // Dibujar línea separadora entre filas
        doc
          .moveTo(40, position + 15)
          .lineTo(575, position + 15)
          .stroke();

        position += itemHeight; // Incrementar posición para la siguiente fila
      });
    }

    // Finaliza el documento
    doc.end();
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).send("Error al generar el reporte.");
  }
});

module.exports = router;
