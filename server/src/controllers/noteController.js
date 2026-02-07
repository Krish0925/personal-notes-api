const db = require("../db");

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, category_id } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Optional: validate category belongs to the user (if provided)
    let catId = category_id ?? null;
    if (catId !== null) {
      const [catRows] = await db.query(
        "SELECT id FROM categories WHERE id = ? AND user_id = ?",
        [catId, userId]
      );
      if (catRows.length === 0) {
        return res.status(400).json({ error: "Invalid category_id for this user" });
      }
    }

    const [result] = await db.query(
      `INSERT INTO notes (user_id, category_id, title, content)
       VALUES (?, ?, ?, ?)`,
      [userId, catId, title.trim(), content.trim()]
    );

    return res.status(201).json({
      id: result.insertId,
      user_id: userId,
      category_id: catId,
      title: title.trim(),
      content: content.trim()
    });
  } catch (err) {
    console.error("CREATE NOTE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `SELECT n.id, n.title, n.content, n.category_id, n.created_at, n.updated_at,
              c.name AS category_name
       FROM notes n
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.user_id = ?
       ORDER BY n.updated_at DESC`,
      [userId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("GET NOTES ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/notes/:id
exports.getNoteById = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = Number(req.params.id);

    if (Number.isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const [rows] = await db.query(
      `SELECT id, title, content, category_id, created_at, updated_at
       FROM notes
       WHERE id = ? AND user_id = ?`,
      [noteId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("GET NOTE BY ID ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = Number(req.params.id);
    const { title, content, category_id } = req.body;

    if (Number.isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    // Check note exists and belongs to user
    const [existing] = await db.query(
      "SELECT id FROM notes WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Validate category belongs to user (if provided)
    let catId = category_id ?? null;
    if (catId !== null) {
      const [catRows] = await db.query(
        "SELECT id FROM categories WHERE id = ? AND user_id = ?",
        [catId, userId]
      );
      if (catRows.length === 0) {
        return res.status(400).json({ error: "Invalid category_id for this user" });
      }
    }

    // Require title/content
    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    await db.query(
      `UPDATE notes
       SET title = ?, content = ?, category_id = ?
       WHERE id = ? AND user_id = ?`,
      [title.trim(), content.trim(), catId, noteId, userId]
    );

    return res.status(200).json({
      message: "Note updated",
      id: noteId,
      title: title.trim(),
      content: content.trim(),
      category_id: catId
    });
  } catch (err) {
    console.error("UPDATE NOTE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = Number(req.params.id);

    if (Number.isNaN(noteId)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const [result] = await db.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [noteId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    console.error("DELETE NOTE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
