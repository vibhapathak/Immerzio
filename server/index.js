import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import contactRoutes from "./routes/ContactsRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import setupSocket from "./socket.js";
import messageRoutes from "./routes/MessagesRoutes.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Allowed Origin:", process.env.ORIGIN);

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Serve static folders first
app.use("/storyboard", express.static("storyboard"));
app.use("/uploads/profiles", express.static("uploads/profiles"));

// Parse cookies and JSON
app.use(cookieParser());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

// Serve built React frontend
app.use(express.static(path.join(__dirname, "client", "dist")));

// Catch-all route for React (SPA)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/storyboard/")) return next(); 
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Start server and connect DB
const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

setupSocket(server);

mongoose.connect(databaseURL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err.message));
