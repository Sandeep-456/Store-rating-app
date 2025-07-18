const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken, allowRoles } = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');

const userOnly = [verifyToken, allowRoles("user")];


//update password
router.put("/update-password", userOnly, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
  if (!passwordRegex.test(newPassword)) {
  return res.status(400).json({
    error: "Password must be 8-16 characters long, include one uppercase letter and one special character.",
  });
}

  db.query("SELECT password FROM users WHERE id = ?", [userId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const hashed = result[0].password;
    bcrypt.compare(oldPassword, hashed, (err, match) => {
      if (!match) {
        return res.status(401).json({ error: "Old password incorrect" });
      }

      bcrypt.hash(newPassword, 10, (err, newHash) => {
        if (err) return res.status(500).json({ error: "Hashing failed" });

        db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, userId], (err, result) => {
          if (err) return res.status(500).json({ error: "Update failed" });
          res.json({ message: "Password updated successfully" });
        });
      });
    });
  });
});


//view all stores with user rating
router.get("/stores", userOnly, (req, res) => {
  const { name, address } = req.query;
  const userId = req.user.id;

  let sql = `
    SELECT 
      s.id, 
      s.name, 
      s.address,
      ROUND(AVG(r.rating),1) AS overall_rating,
      MAX(ur.rating) AS user_rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
    WHERE 1
  `;

  const params = [userId];

  if (name) {
    sql += " AND s.name LIKE ?";
    params.push(`%${name}%`);
  }

  if (address) {
    sql += " AND s.address LIKE ?";
    params.push(`%${address}%`);
  }

  sql += " GROUP BY s.id, s.name, s.address";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Store fetch failed" });
    }
    res.json({ stores: results });
  });
});



// Submit rating
router.post("/ratings", userOnly, (req, res) => {
  const { store_id, rating } = req.body;
  const user_id = req.user.id;

  if (!store_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Invalid rating" });
  }

  const checkSql = "SELECT * FROM ratings WHERE user_id = ? AND store_id = ?";
  db.query(checkSql, [user_id, store_id], (err, results) => {
    if (err) {
      console.error("Rating check error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Rating already exists. Use update endpoint." });
    }

    const ratingId = uuidv4(); // ✅ Generate a unique ID

    const insertSql = "INSERT INTO ratings (id, user_id, store_id, rating) VALUES (?, ?, ?, ?)";
    db.query(insertSql, [ratingId, user_id, store_id, rating], (err, result) => {
      if (err) {
        console.error("Insert error:", err); // ✅ log exact MySQL error
        return res.status(500).json({ error: "Rating insert failed" });
      }

      res.status(201).json({ message: "Rating submitted successfully" });
    });
  });
});



//update existing rating
router.put("/ratings/:store_id", userOnly, (req, res) => {
  const { rating } = req.body;
  const user_id = req.user.id;
  const store_id = req.params.store_id;

  const sql = "UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?";

  db.query(sql, [rating, user_id, store_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update rating" });
    res.json({ message: "Rating updated" });
  });
});

//view all ratings 
router.get("/ratings", userOnly, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT r.id, s.name AS store_name, s.address, r.rating
    FROM ratings r
    JOIN stores s ON r.store_id = s.id
    WHERE r.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Could not fetch ratings" });
    res.json({ ratings: results });
  });
});

module.exports = router;
