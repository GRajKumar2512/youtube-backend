import multer from "multer";

// TASK: created the middleware for the storage of the file
const storage = multer.diskStorage({
  // destination is the path the file should be stored
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  // filename is the name of the file when uploaded to that destination
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// TASK: provided multer with the storage instructions, letting it act as the middleware
export const upload = multer({ storage: storage });
