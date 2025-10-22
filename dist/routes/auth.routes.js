import { login, register } from "../controllers/auth.controllers.js";
import { Router } from "express";
const router = Router();
router.post("/register", register);
router.post("/login", login);
export default router;
//# sourceMappingURL=auth.routes.js.map