const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("../config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const authRoutes = require("../routes/authRoutes");
const requestRoutes = require("../routes/requestRoutes");
const userRoutes = require("../routes/userRoutes");
const errorHandler = require("../middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

// Use cors middleware  
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Make upload middleware available to routes
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

// For Vercel serverless deployment
module.exports = app;