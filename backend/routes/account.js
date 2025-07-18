const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("../middlewares/authMiddleware");

// ✅ All roles can update their password
router.put("/update-password", verifyToken, (req, res) => {
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

    bcrypt.compare(oldPassword, hashed, (err, isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ error: "Old password incorrect" });
      }

      bcrypt.hash(newPassword, 10, (err, newHash) => {
        if (err) return res.status(500).json({ error: "Password encryption failed" });

        db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, userId], (err) => {
          if (err) return res.status(500).json({ error: "Failed to update password" });
          res.json({ message: "Password updated successfully" });
        });
      });
    });
  });
});

module.exports = router;
