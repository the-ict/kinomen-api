import { Router } from "express";
import { createComment, getCommentsForPost, updateComment, deleteComment, getCommentReplies, } from "../controllers/comment.controllers.js";
import { authMiddleware } from "../middlewares/jwt.middleware.js";
const router = Router();
router.post("/", authMiddleware, createComment);
router.get("/post/:postId", getCommentsForPost);
router.put("/:id", authMiddleware, updateComment);
router.delete("/:id", authMiddleware, deleteComment);
router.get("/:commentId/replies", getCommentReplies);
export default router;
//# sourceMappingURL=comment.routes.js.map