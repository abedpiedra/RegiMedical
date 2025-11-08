// middlewares/uploadFoto.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const FOTOS_DIR = path.join(process.cwd(), "Equipos_Fotos");
if (!fs.existsSync(FOTOS_DIR)) fs.mkdirSync(FOTOS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, FOTOS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    const name = `${Date.now()}_${base}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/^image\//i.test(file.mimetype)) cb(null, true);
  else cb(new Error("Sólo se aceptan imágenes"), false);
};

export const uploadFoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});
