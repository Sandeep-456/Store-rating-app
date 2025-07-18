const express = require("express");
const router = express.Router();
const { verifyToken, allowRoles } = require("../middlewares/authMiddleware");

router.get("/admin-only", verifyToken, allowRoles("admin"), (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

router.get("/user-only", verifyToken, allowRoles("user"), (req, res) => {
  res.json({ message: "Welcome, User!" });
});

router.get("/store-owner-only", verifyToken, allowRoles("store_owner"), (req, res) => {
  res.json({ message: "Welcome, Store Owner!" });
});

module.exports = router;
