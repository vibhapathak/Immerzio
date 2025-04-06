// routes/commentRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  toggleLikeComment
} from "../controllers/CommentController.js";

const commentRoutes = Router();

// Comment routes
commentRoutes.get("/posts/:postId/comments", getPostComments);
commentRoutes.post("/posts/:postId/comments", verifyToken, createComment);
commentRoutes.put("/comments/:commentId", verifyToken, updateComment);
commentRoutes.delete("/comments/:commentId", verifyToken, deleteComment);
commentRoutes.post("/comments/:commentId/like", verifyToken, toggleLikeComment);

export default commentRoutes;