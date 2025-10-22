import type { Request, Response } from "express";
import { prisma } from "../index.js";
import type { AuthRequest } from "../middlewares/jwt.middleware.js";

const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, content, parentId } = req.body;
    const user = req.user as any;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const post = await prisma.post.findUnique({ where: { id: Number(postId) } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await prisma.comment.create({
      data: {
        postId: Number(postId),
        content,
        authorId: user.id,
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        author: true,
        post: true,
        parent: true,
        replies: true,
      },
    });

    return res.status(201).json({ message: "Comment created", comment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create comment" });
  }
};

const getCommentsForPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId), parentId: null }, // Only top-level comments
      include: {
        author: true,
        replies: {
          include: {
            author: true,
            replies: true, // Nested replies
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch comments" });
  }
};

const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user as any;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const comment = await prisma.comment.findUnique({ where: { id: Number(id) } });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.authorId !== user.id) return res.status(403).json({ message: "Forbidden" });

    const updatedComment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { content },
      include: {
        author: true,
        post: true,
        parent: true,
        replies: true,
      },
    });

    return res.status(200).json({ message: "Comment updated", comment: updatedComment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update comment" });
  }
};

const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as any;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const comment = await prisma.comment.findUnique({ where: { id: Number(id) } });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.authorId !== user.id) return res.status(403).json({ message: "Forbidden" });

    await prisma.comment.delete({ where: { id: Number(id) } });

    return res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete comment" });
  }
};

const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const replies = await prisma.comment.findMany({
      where: { parentId: Number(commentId) },
      include: {
        author: true,
        replies: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(replies);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch replies" });
  }
};

export {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment,
  getCommentReplies,
};