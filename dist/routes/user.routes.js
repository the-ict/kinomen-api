import { Router } from "express";
import { getProfile, getMyProfile, updateUser, deleteUser, toggleFollow, toggleWatchlist, checkUsernameAvailability } from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/jwt.middleware.js";
const router = Router();
router.get("/profile/:id", getProfile);
router.get("/profile/get-by-token/me", authMiddleware, getMyProfile);
router.get("/check-username/:username", checkUsernameAvailability);
router.put("/profile/:id", authMiddleware, updateUser);
router.delete("/profile/:id", authMiddleware, deleteUser);
router.post("/follow/:id", authMiddleware, toggleFollow);
router.post("/watchlist/:id", authMiddleware, toggleWatchlist);
export default router;
//# sourceMappingURL=user.routes.js.map