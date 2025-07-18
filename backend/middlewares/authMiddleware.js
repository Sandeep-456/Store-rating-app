const jwt = require("jsonwebtoken");

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Token format: Bearer tokenstring
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded { id, role } to req
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Role-based access control
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. You are not authorized." });
    }
    next();
  };
};

