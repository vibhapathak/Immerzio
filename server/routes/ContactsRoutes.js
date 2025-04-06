import { searchContacts } from "../controllers/ContactsController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { Router } from "express";


const contactsRoutes = Router();

contactsRoutes.post("/search", verifyToken, searchContacts);

export default contactsRoutes;