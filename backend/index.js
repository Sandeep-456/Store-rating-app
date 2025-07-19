const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fs = require('fs');


const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes_TEMP");
const protectedRoutes = require("./routes/protectedRoutes");
const userRoutes = require("./routes/userRoutes");
const storeOwnerRoutes = require("./routes/storeOwnerRoutes");


const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://store-rating-app-xi.vercel.app'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/protected", protectedRoutes);

app.use("/api/users", userRoutes);
app.use("/api/store-owner", storeOwnerRoutes);

app.use("/api/account", require("./routes/account"));





// Default route
app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`) 
  try {
  const ca = fs.readFileSync('./ca.pem');
  // ... rest of your connection code
  // console.log(ca)
} catch (readErr) {
  console.error('Error reading CA certificate file:', readErr);
  // Exit or handle appropriately if the file can't be read
}});
