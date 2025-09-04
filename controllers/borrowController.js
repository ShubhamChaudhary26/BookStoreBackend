import BorrowRecord from "../models/BorrowRecord.js";
import Book from "../models/Book.js";




export const getMyBorrowedBooks = async (req, res) => {
  try {
    const studentId = req.user._id;
    const records = await BorrowRecord.find({
      student: studentId,
      returnDate: null, // only active borrows
    }).populate("book", "title author category coverImage");

    const today = new Date();

    // enrich each record with overdue + fine
    const enrichedRecords = records.map((r) => {
      let fine = 0;
      let isOverdue = false;

      if (today > r.dueDate) {
        isOverdue = true;
        const daysLate = Math.ceil(
          (today - new Date(r.dueDate)) / (1000 * 60 * 60 * 24)
        );
        fine = daysLate * 5;
      }

      return {
        ...r._doc, 
        isOverdue,
        fine,
      };
    });

    res.json(enrichedRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all borrowed books
export const allBorrowedBooks = async (req, res) => {
  try {
    const records = await BorrowRecord.find()
      .populate("student", "name email role")
      .populate("book", "title author category coverImage");
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Borrow book
export const borrowBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const studentId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book || !book.available) {
      return res.status(400).json({ message: "Book not available" });
    }

    const borrowedBooks = await BorrowRecord.find({ student: studentId, returnDate: null });
    const hasOverdue = borrowedBooks.some(record => new Date(record.dueDate) < new Date());
    if (hasOverdue) {
      return res.status(400).json({ message: "You have overdue books. Return them first." });
    }

    if (borrowedBooks.length >= 3) {
      return res.status(400).json({ message: "You can borrow only 3 books at a time" });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrowRecord = await BorrowRecord.create({
      student: studentId,
      book: bookId,
      dueDate,
    });

    book.available = false;
    await book.save();

    // ✅ Populate before sending
    const populatedRecord = await borrowRecord.populate([
      { path: "book", select: "title author category coverImage" },
      { path: "student", select: "name email" },
    ]);

    res.status(201).json(populatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const returnBook = async (req, res) => {
  try {
    const borrowId = req.params.borrowId; // ✅ Correct param now
    const record = await BorrowRecord.findById(borrowId)
      .populate("book", "title author category coverImage")
      .populate("student", "name email");

    if (!record || record.returnDate) {
      return res.status(400).json({ message: "No active borrow record found" });
    }

    record.returnDate = new Date();

    // Fine calculation
    let fine = 0;
    if (record.returnDate > record.dueDate) {
      const daysLate = Math.ceil(
        (record.returnDate - record.dueDate) / (1000 * 60 * 60 * 24)
      );
      fine = daysLate * 5;
    }
    record.fine = fine;
    await record.save();

    // Mark book as available
    const book = await Book.findById(record.book._id);
    book.available = true;
    await book.save();

    res.json({
      message: "Book returned successfully",
      fine,
      record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ Controller to get overdue borrowed books
export const overdueBooks = async (req, res) => {
  try {
    const today = new Date();
    const overdue = await BorrowRecord.find({
      dueDate: { $lt: today }, // due date is in the past
      returnDate: null,        // not yet returned
    })
      .populate("book", "title author category coverImage")
      .populate("student", "name email");

    res.json(overdue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all borrowed books (Librarian)
export const getAllBorrowedBooks = async (req, res) => {
  try {
    const borrowed = await BorrowRecord.find()
      .populate("book", "title author category coverImage")
      .populate("student", "name email");

    res.json(borrowed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
