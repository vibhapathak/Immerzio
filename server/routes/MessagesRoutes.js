import { getMessages } from "../controllers/MessagesController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { Router } from "express";

const messageRoutes = Router();  // Changed to match your import name
messageRoutes.post("/get-messages", verifyToken, getMessages);
export default messageRoutes;    // Changed to match your import name