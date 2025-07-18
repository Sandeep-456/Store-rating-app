const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { verifyToken, allowRoles } = require("../middlewares/authMiddleware");

// Middleware: Only admin can access these routes
const adminOnly = [verifyToken, allowRoles("admin")];

// Helper function to validate form fields
function validateUserInput({ name, email, password, address, role }) {
  const errors = [];

  if (!name || name.length < 20 || name.length > 60) {
    errors.push("Name must be between 20 and 60 characters.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Invalid email format.");
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.push("Password must be 8-16 characters long, include one uppercase letter and one special character.");
  }

  if (!address || address.length > 400) {
    errors.push("Address must not exceed 400 characters.");
  }

  if (!["admin", "user", "store_owner"].includes(role)) {
    errors.push("Invalid role.");
  }

  return errors;
}

// 1. Admin Dashboard with Totals
router.get("/dashboard", adminOnly, (req, res) => {
  const dashboardData = {};
  const queries = [
    { key: "totalUsers", sql: "SELECT COUNT(*) AS total FROM users" },
    { key: "totalStores", sql: "SELECT COUNT(*) AS total FROM stores" },
    { key: "totalRatings", sql: "SELECT COUNT(*) AS total FROM ratings" },
  ];

  let completed = 0;

  queries.forEach((q) => {
    db.query(q.sql, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Dashboard fetch failed" });
      }
      dashboardData[q.key] = result[0].total;
      completed++;
      if (completed === queries.length) {
        res.json(dashboardData);
      }
    });
  });
});

// 2. Add New User (admin, user, or store_owner)
router.post("/users", adminOnly, (req, res) => {
  const { name, email, password, address, role } = req.body;

  const errors = validateUserInput({ name, email, password, address, role });
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const userId = uuidv4();

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: "Password hashing failed" });

    const sql = "INSERT INTO users (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [userId, name, email, hashedPassword, address, role], (err, result) => {
      if (err) return res.status(500).json({ error: "User creation failed" });
      res.status(201).json({ message: "User created successfully" });
    });
  });
});

// 3. View All Users with Optional Filters (Normal and Admin only)
router.get("/users", adminOnly, (req, res) => {
  const { name, email, address, role, sortBy, order } = req.query;
  let sql = "SELECT id, name, email, address, role FROM users WHERE 1=1";
  const params = [];

  if (name) {
    sql += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (email) {
    sql += " AND email LIKE ?";
    params.push(`%${email}%`);
  }
  if (address) {
    sql += " AND address LIKE ?";
    params.push(`%${address}%`);
  }
  if (role) {
    sql += " AND role = ?";
    params.push(role);
  }

  if (sortBy && ["name", "email"].includes(sortBy)) {
    const sortOrder = order && order.toUpperCase() === "DESC" ? "DESC" : "ASC";
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch users" });
    res.json({ users: results });
  });
});


// 4. Get User Details (including rating if store_owner)
router.get("/users/:id", adminOnly, (req, res) => {
  const userId = req.params.id;

  const sql = "SELECT id, name, email, address, role FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = results[0];

    if (user.role === "store_owner") {
      const ratingSql = `SELECT ROUND(AVG(rating), 1) AS average_rating FROM ratings WHERE store_id = ?`;
      db.query(ratingSql, [user.id], (err, ratingResults) => {
        user.average_rating = ratingResults[0].average_rating || 0;
        res.json({ user });
      });
    } else {
      res.json({ user });
    }
  });
});

// 5. View Stores with Average Rating and Optional Filters
router.get("/stores", adminOnly, (req, res) => {
  const { name, email, address, sortBy, order } = req.query;
  let sql = `
    SELECT s.id, s.name, s.email, s.address,
    ROUND(AVG(r.rating), 1) AS average_rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1
  `;
  const params = [];

  if (name) {
    sql += " AND s.name LIKE ?";
    params.push(`%${name}%`);
  }
  if (email) {
    sql += " AND s.email LIKE ?";
    params.push(`%${email}%`);
  }
  if (address) {
    sql += " AND s.address LIKE ?";
    params.push(`%${address}%`);
  }

  sql += " GROUP BY s.id";

  if (sortBy && ["name", "email"].includes(sortBy)) {
    const sortOrder = order && order.toUpperCase() === "DESC" ? "DESC" : "ASC";
    sql += ` ORDER BY s.${sortBy} ${sortOrder}`;
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Failed to fetch stores" });
    res.json({ stores: results });
  });
});

// 6. Add New Store with UUID
router.post("/stores", adminOnly, (req, res) => {
  const { name, email, address } = req.body;

  if (!name || !email || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const storeId = uuidv4();
  const sql = "INSERT INTO stores (id, name, email, address) VALUES (?, ?, ?, ?)";
  db.query(sql, [storeId, name, email, address], (err, result) => {
    if (err) return res.status(500).json({ error: "Store creation failed" });
    res.status(201).json({ message: "Store added successfully" });
  });
});

// 7.Get all ratings
router.get("/ratings", adminOnly, (req, res) => {
  const sql = `
    SELECT 
      s.name AS store_name,
      s.address,
      u.name AS user_name,
      u.email AS user_email,
      r.rating,
      r.id AS rating_id,
      r.created_at
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    JOIN stores s ON r.store_id = s.id
    ORDER BY r.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Ratings Fetch Error:", err);
      return res.status(500).json({ error: "Failed to fetch ratings" });
    }

    res.json({ ratings: results });
  });
});

// 8.DELETE User
router.delete("/users/:id", adminOnly, (req, res) => {
  const userId = req.params.id;
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ error: "User deletion failed" });
    res.json({ message: "User deleted successfully" });
  });
});

// 9.DELETE Store
router.delete("/stores/:id", adminOnly, (req, res) => {
  const storeId = req.params.id;
  db.query("DELETE FROM stores WHERE id = ?", [storeId], (err, result) => {
    if (err) return res.status(500).json({ error: "Store deletion failed" });
    res.json({ message: "Store deleted successfully" });
  });
});

// 10.DELETE Rating
router.delete("/ratings/:id", adminOnly, (req, res) => {
  const ratingId = req.params.id;
  db.query("DELETE FROM ratings WHERE id = ?", [ratingId], (err, result) => {
    if (err) return res.status(500).json({ error: "Rating deletion failed" });
    res.json({ message: "Rating deleted successfully" });
  });
});

// Update User
router.put("/users/:id", adminOnly, (req, res) => {
  const { name, email, address, role } = req.body;
  const userId = req.params.id;

  const sql = "UPDATE users SET name = ?, email = ?, address = ?, role = ? WHERE id = ?";
  db.query(sql, [name, email, address, role, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update user" });
    res.json({ message: "User updated successfully" });
  });
});

// Update Store
router.put("/stores/:id", adminOnly, (req, res) => {
  const { name, email, address } = req.body;
  const storeId = req.params.id;

  const sql = "UPDATE stores SET name = ?, email = ?, address = ? WHERE id = ?";
  db.query(sql, [name, email, address, storeId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update store" });
    res.json({ message: "Store updated successfully" });
  });
});

// Update Rating
router.put("/ratings/:id", adminOnly, (req, res) => {
  const { rating } = req.body;
  const ratingId = req.params.id;

  const sql = "UPDATE ratings SET rating = ? WHERE id = ?";
  db.query(sql, [rating, ratingId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update rating" });
    res.json({ message: "Rating updated successfully" });
  });
});




module.exports = router;
