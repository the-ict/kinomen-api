import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/jwt.middleware.js";
declare const createComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getCommentsForPost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const updateComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const deleteComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getCommentReplies: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const toggleLikeComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const toggleDislikeComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getMyComments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export { createComment, getCommentsForPost, updateComment, deleteComment, getCommentReplies, toggleLikeComment, toggleDislikeComment, getMyComments, };
//# sourceMappingURL=comment.controllers.d.ts.map