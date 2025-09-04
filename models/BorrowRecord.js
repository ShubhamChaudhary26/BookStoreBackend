import mongoose from "mongoose";

const borrowRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
  dueDate: { type: Date, required: true },
  fine: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("BorrowRecord", borrowRecordSchema);
