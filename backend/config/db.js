require('dotenv').config(); 

const mysql = require('mysql2');

const fs = require('fs');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  family: 4,
  ssl: {
    ca: fs.readFileSync('ca.pem'),
  },
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL DB');
});

module.exports = connection;
