import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/jwt.middleware.js";
declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getMyProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const updateUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const deleteUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const toggleFollow: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const toggleWatchlist: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const checkUsernameAvailability: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { getProfile, getMyProfile, updateUser, deleteUser, toggleFollow, toggleWatchlist, checkUsernameAvailability };
//# sourceMappingURL=user.controllers.d.ts.map