const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!["user", "store_owner"].includes(role)) {
    return res.status(403).json({ error: "Signup allowed only for user or store_owner roles." });
  }

  const errors = [];

  if (!name || name.length < 3 || name.length > 60) {
    errors.push("Name must be between 3 and 60 characters.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Invalid email format.");
  }

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    errors.push("Password must be 8-16 characters, include one uppercase letter and one special character.");
  }

  if (!address || address.length > 400) {
    errors.push("Address must not exceed 400 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" ") });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: "Password encryption failed" });

    const userId = uuidv4();

    const sql = "INSERT INTO users (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [userId, name, email, hashedPassword, address, role], (err, result) => {
      if (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Signup failed" });
      }

      // ✅ Create and return JWT
      const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: userId,
          name,
          role,
        },
      });
    });
  });
};



exports.login = (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    // Compare hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });
    });
  });
};



exports.getMe = (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT id, name, email, address, role FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result[0] });
  });
};