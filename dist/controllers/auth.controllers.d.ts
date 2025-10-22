import type { Request, Response } from "express";
declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { register, login };
//# sourceMappingURL=auth.controllers.d.ts.map