const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AppError = require("../errors/AppError");

const ALLOWED_TYPES = {
  "image/jpeg": { folder: "uploads/images", extensions: [".jpg", ".jpeg"] },
  "image/png": { folder: "uploads/images", extensions: [".png"] },
  "image/gif": { folder: "uploads/images", extensions: [".gif"] },
  "image/webp": { folder: "uploads/images", extensions: [".webp"] },
  "video/mp4": { folder: "uploads/videos", extensions: [".mp4"] },
  "video/mpeg": { folder: "uploads/videos", extensions: [".mpeg", ".mpg"] },
  "video/quicktime": { folder: "uploads/videos", extensions: [".mov"] },
  "video/x-msvideo": { folder: "uploads/videos", extensions: [".avi"] },
  "application/pdf": { folder: "uploads/documents", extensions: [".pdf"] },
  "application/msword": { folder: "uploads/documents", extensions: [".doc"] },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    folder: "uploads/documents",
    extensions: [".docx"],
  },
  "application/vnd.ms-excel": {
    folder: "uploads/documents",
    extensions: [".xls"],
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    folder: "uploads/documents",
    extensions: [".xlsx"],
  },
  "audio/mpeg": { folder: "uploads/others", extensions: [".mp3"] },
  "audio/wav": { folder: "uploads/others", extensions: [".wav"] },
};

const createFolders = () => {
  const folders = [
    "uploads",
    ...new Set(Object.values(ALLOWED_TYPES).map((type) => type.folder)),
  ];
  folders.forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      // ✅ removed console.log
    }
  });
};

createFolders();

// ✅ reusable extension + mimetype validator
const validateFileType = (allowedMimetypes) => (req, file, cb) => {
  const fileConfig = ALLOWED_TYPES[file.mimetype];
  const ext = path.extname(file.originalname).toLowerCase();

  // ✅ check both mimetype and extension match
  if (
    fileConfig &&
    fileConfig.extensions.includes(ext) &&
    allowedMimetypes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError("File type not allowed or extension mismatch!", 400),
      false,
    );
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileConfig = ALLOWED_TYPES[file.mimetype];
    if (fileConfig) {
      cb(null, fileConfig.folder);
    } else {
      cb(new AppError("File type not allowed!", 400), false);
    }
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const randomNum = Math.round(Math.random() * 1e9);
    const uniqueName = `${timestamp}-${randomNum}${originalExt}`;
    cb(null, uniqueName);
  },
});

// ✅ image upload — validates both mimetype and extension
exports.uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: validateFileType((mime) => mime.startsWith("image/")),
}).single("image");

// ✅ video upload
exports.uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: validateFileType((mime) => mime.startsWith("video/")),
}).single("video");

// ✅ document upload
exports.uploadDocument = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: validateFileType((mime) =>
    [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ].includes(mime),
  ),
}).single("document");

// ✅ multiple images
exports.uploadMultipleImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: validateFileType((mime) => mime.startsWith("image/")),
}).array("images", 10);

// ✅ profile with documents
exports.uploadProfileWithDocs = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: validateFileType((mime) => !!ALLOWED_TYPES[mime]),
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "certificates", maxCount: 5 },
]);
