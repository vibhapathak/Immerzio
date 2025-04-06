// routes/postRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/AuthMiddleware.js";
import { 
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost
} from "../controllers/PostController.js";

const postRoutes = Router();

// Post routes
postRoutes.get("/posts", getAllPosts);
postRoutes.get("/posts/:postId", getPostById);
postRoutes.post("/posts", verifyToken, createPost);
postRoutes.put("/posts/:postId", verifyToken, updatePost);
postRoutes.delete("/posts/:postId", verifyToken, deletePost);
postRoutes.post("/posts/:postId/like", verifyToken, toggleLikePost);

export default postRoutes;