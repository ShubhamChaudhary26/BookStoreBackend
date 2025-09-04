import Book from "../models/Book.js";

export const addBook = async (req, res) => {
  try {
    const { title, author, category } = req.body;
    const coverImage = req.file ? `uploads/${req.file.filename}` : null; // ✅ FIXED

    const book = await Book.create({
      title,
      author,
      category,
      coverImage,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    book.category = req.body.category || book.category;
    book.available = req.body.available ?? book.available;

    if (req.file) {
      book.coverImage = `uploads/${req.file.filename}`; // ✅ FIXED
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc Get all books
// @route GET /api/books
// @access Public
export const getBooks = async (req, res) => {
  try {
    const { search, category, available } = req.query;

    let query = {};

    // Search by title or author (case insensitive)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    // Filter by availability
    if (available) {
      query.available = available === "true";
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single book
// @route GET /api/books/:id
// @access Public
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc Delete book (librarian only)
// @route DELETE /api/books/:id
// @access Librarian
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: "Book not found" });

    await book.deleteOne();
    res.json({ message: "Book removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



