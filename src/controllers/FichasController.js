const { Router } = require("express");
const router = Router();
const verifyToken = require("./VerifyToken");
const Ficha = require("../models/ficha");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
// ENDPOINT - REGISTER

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


router.post("/ficha/register", upload.single("pdf"), async (req, res) => {
  try {
    console.log(req);

    const payload = req.body;
    req.body.pdf = req.file.filename;
    const requeste = await Ficha.create(payload);
    res.status(201).json(requeste);
  } catch (error) {
    console.error("Error al registrar la ficha:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
