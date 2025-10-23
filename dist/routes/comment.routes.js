import { Router } from "express";
import { createComment, getCommentsForPost, updateComment, deleteComment, getCommentReplies, toggleLikeComment, toggleDislikeComment, getMyComments, } from "../controllers/comment.controllers.js";
import { authMiddleware } from "../middlewares/jwt.middleware.js";
const router = Router();
router.post("/", authMiddleware, createComment);
router.get("/post/:postId", getCommentsForPost);
router.get("/get-by-token/me", authMiddleware, getMyComments);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);
router.get("/:commentId/replies", getCommentReplies);
router.post("/:id/like", authMiddleware, toggleLikeComment);
router.post("/:id/dislike", authMiddleware, toggleDislikeComment);
export default router;
//# sourceMappingURL=comment.routes.js.map