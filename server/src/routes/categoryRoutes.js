const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCategories,
  createCategory
} = require("../controllers/categoryController");

const router = express.Router();

// Protect everything in this router
router.use(authMiddleware);

router.get("/", getCategories);
router.post("/", createCategory);

module.exports = router;
