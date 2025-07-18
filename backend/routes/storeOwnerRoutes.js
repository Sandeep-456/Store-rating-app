// backend/routes/storeOwnerRoutes.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { verifyToken, allowRoles } = require("../middlewares/authMiddleware");

const storeOwnerOnly = [verifyToken, allowRoles("store_owner")];

// 1.Update Password
router.put("/update-password", storeOwnerOnly, (req, res) => {
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

        db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, userId], (err) => {
          if (err) return res.status(500).json({ error: "Update failed" });
          res.json({ message: "Password updated successfully" });
        });
      });
    });
  });
});

// 2.View All Ratings from All Users for All Stores (Global View)
router.get("/ratings", storeOwnerOnly, (req, res) => {
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


// 3.Get overall and store-wise average ratings
router.get("/average-rating", storeOwnerOnly, (req, res) => {
  const sql = `
    SELECT 
      ROUND(AVG(r.rating), 1) AS overall_average_rating
    FROM ratings r
  `;

  const storeWiseSql = `
    SELECT 
      s.name AS store_name,
      ROUND(AVG(r.rating), 1) AS average_rating
    FROM ratings r
    JOIN stores s ON r.store_id = s.id
    GROUP BY r.store_id, s.name
  `;

  db.query(sql, (err, overallResult) => {
    if (err) return res.status(500).json({ error: "Failed to fetch overall average rating" });

    db.query(storeWiseSql, (err2, storeResults) => {
      if (err2) return res.status(500).json({ error: "Failed to fetch store-wise average ratings" });

      res.json({
        overall_average_rating: overallResult[0].overall_average_rating || 0,
        store_wise_average_ratings: storeResults || []
      });
    });
  });
});


module.exports = router;
