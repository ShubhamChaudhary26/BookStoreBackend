import express from "express";
import {
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
  getAllBorrowedBooks,
  overdueBooks,
} from "../controllers/borrowController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:bookId", protect, borrowBook);
router.put("/return/:borrowId", protect, returnBook);
router.get("/my", protect, getMyBorrowedBooks);
router.get("/all", protect, adminOnly, getAllBorrowedBooks);
router.get("/overdue", protect, adminOnly, overdueBooks);

export default router;
