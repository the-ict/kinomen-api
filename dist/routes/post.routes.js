import { Router } from "express";
import { createPost, getPosts, getPost, updatePost, deletePost, toggleLike, getMostDiscussedPosts, getMyPosts, searchPostsByMovie } from "../controllers/post.controllers.js";
import { authMiddleware } from "../middlewares/jwt.middleware.js";
const router = Router();
router.get("/", getPosts);
router.get("/:id", getPost);
router.get("/get-by-token/me", authMiddleware, getMyPosts);
router.post("/", authMiddleware, createPost);
router.post("/search/movie", searchPostsByMovie);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/like", authMiddleware, toggleLike);
router.get("/discussed/most", getMostDiscussedPosts);
export default router;
//# sourceMappingURL=post.routes.js.map