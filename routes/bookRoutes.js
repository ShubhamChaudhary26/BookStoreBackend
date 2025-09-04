import express from "express";
import multer from "multer";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.get("/", getBooks);
router.get("/:id", getBookById);

router.post("/", protect, adminOnly, upload.single("coverImage"), addBook);
router.put("/:id", protect, adminOnly, upload.single("coverImage"), updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);

export default router;
