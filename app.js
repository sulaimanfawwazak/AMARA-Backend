const express = require("express");
const cors = require("cors");
const multer = require("multer");
// const { getDocument } = require("pdfjs-dist/legacy/build/pdf.js");
const { getDocument } = require("pdfjs-dist/build/pdf.js");
// const pdf = require('pdf-parse');
const {
  parseJenisUjian,
  parseNamaLengkap,
  parseNim,
  parseProdi,
  parseRows,
  parseMataKuliah,
  parseTanggal,
  parseJam,
  parseRuangan,
  parseNoKursi,
  makeDict
} = require("./parse_data");

// Initialize the Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://ugmexam2gcal.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'  // For local dev
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}))

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    }
    else {
      cb(new Error("File must be a PDF"), false);
    }
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "healthy" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Upplaod endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file is uploaded." });
    }

    // Extract texts from PDF using pdf-parse
    const pdfBuffer = req.file.buffer;

    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(pdfBuffer);
    // const data = await pdf(pdfBuffer);

    // Load PDF
    const loadingTask = getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    if (pdfDocument.numPages === 0) {
      return res.status(400).json({ error: "PDF contains no page." });
    }

    // Get first page
    const page = await pdfDocument.getPage(1);
    const textContent = await page.getTextContent();

    // Extract text and replace new lines with spaces
    const texts = textContent.items
      .map(item => item.str)
      .join(' ')
      .replace(/\s{2,}/g, ' ');
    //   // .replace(/\s{2}/g, ' ');
    //   // .replace(/\n/g, ' ');

    // const texts = data.text.replace(/\s{2,}/g, ' ')

    console.log(texts);

    // HEADER parsing
    const jenisUjian = parseJenisUjian(texts);
    const namaLengkap = parseNamaLengkap(texts);
    const nim = parseNim(texts);
    const prodi = parseProdi(texts);

    // TABLE parsing
    const rows = parseRows(texts);
    const mataKuliahArr = rows.map(row => parseMataKuliah(row));
    const tanggalArr = rows.map(row => parseTanggal(row));
    const jamArr = rows.map(row => parseJam(row));
    const ruanganArr = rows.map(row => parseRuangan(row));
    const noKursiArr = rows.map(row => parseNoKursi(row));

    const eventsArr = makeDict(
      mataKuliahArr,
      tanggalArr,
      jamArr,
      ruanganArr,
      noKursiArr,
      jenisUjian
    );

    const result = {
      jenis_ujian: jenisUjian,
      nama_lengkap: namaLengkap,
      nim: nim,
      prodi: prodi,
      jadwal: eventsArr
    };

    res.json(result);
  }
  catch (error) {
    console.error("Parsing error", error);
    res.status(500).json({ error: `Parsing failed: ${error.message}`})
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File is too large" });
    }
  }

  if (error.message === "File must be a PDF") {
    return res.status(400).json({ error: "File must be a PDF" });
  }

  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;