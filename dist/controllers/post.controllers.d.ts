import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/jwt.middleware.js";
declare const createPost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getPosts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getPost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const updatePost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const deletePost: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const toggleLike: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getMostDiscussedPosts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getMyPosts: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const searchPostsByMovie: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { createPost, getPosts, getPost, updatePost, deletePost, toggleLike, getMostDiscussedPosts, getMyPosts, searchPostsByMovie };
//# sourceMappingURL=post.controllers.d.ts.map