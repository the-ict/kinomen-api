import { verifyToken } from "../utils/generateToken.js";
export function authMiddleware(req, res, next) {
    const header = req.headers.authorization || req.headers.Authorization;
    const token = typeof header === "string" && header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (!token)
        return res.status(401).json({ message: "No token provided" });
    try {
        const payload = verifyToken(token);
        req.user = payload;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}
import jwt from "jsonwebtoken";
//# sourceMappingURL=jwt.middleware.js.map