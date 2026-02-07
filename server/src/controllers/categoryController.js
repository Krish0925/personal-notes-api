const db = require("../db");

// GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT id, name FROM categories WHERE user_id = ? ORDER BY name ASC",
      [userId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const cleanName = name.trim();

    // Check duplicate for same user
    const [existing] = await db.query(
      "SELECT id FROM categories WHERE user_id = ? AND name = ?",
      [userId, cleanName]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Category already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO categories (name, user_id) VALUES (?, ?)",
      [cleanName, userId]
    );

    return res.status(201).json({
      id: result.insertId,
      name: cleanName
    });
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
