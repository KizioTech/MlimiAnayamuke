import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configure CORS for security - only allow specific origins
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com', 'https://www.yourdomain.com'] // Replace with your actual domains
    : ['http://localhost:8080', 'http://localhost:3000'], // Development origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Add payload size limit

// connect to MariaDB/MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MariaDB!");
  }
});

// Input validation middleware
const validateUserId = (req, res, next) => {
  const userId = req.params.id;

  // Check if userId is a valid number
  if (!userId || !/^\d+$/.test(userId)) {
    return res.status(400).json({
      error: "Invalid user ID",
      message: "User ID must be a positive integer"
    });
  }

  // Check if userId is within reasonable bounds
  const id = parseInt(userId);
  if (id <= 0 || id > 999999999) {
    return res.status(400).json({
      error: "Invalid user ID",
      message: "User ID out of valid range"
    });
  }

  next();
};

// API route to get user by ID
app.get("/api/user/:id", validateUserId, (req, res) => {
  const userId = req.params.id;

  db.query("SELECT id, name, email, created_at FROM users WHERE id = ? AND deleted = 0",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          error: "Database error",
          message: "Failed to retrieve user data"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: "User not found",
          message: "No user found with the specified ID"
        });
      }

      res.json(results[0]);
    });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
