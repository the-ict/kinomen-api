import { Router } from "express";
import multer from "multer";
import { getProfile, getMyProfile, updateUser, deleteUser, toggleFollow, toggleWatchlist, checkUsernameAvailability, getUserFollows, getUserFavorites, toggleFavorite } from "../controllers/user.controllers.js";
import { authMiddleware } from "../middlewares/jwt.middleware.js";
const router = Router();
const upload = multer({ dest: 'uploads/' });
router.get("/profile/:id", getProfile);
router.get("/profile/get-by-token/me", authMiddleware, getMyProfile);
router.get("/profile/:id/follows", getUserFollows);
router.get("/profile/:id/favorites", getUserFavorites);
router.get("/check-username/:username", checkUsernameAvailability);
router.put("/profile/:id", authMiddleware, upload.fields([{ name: 'profileImage' }, { name: 'coverImage' }]), updateUser);
router.delete("/profile/:id", authMiddleware, deleteUser);
router.post("/follow/:id", authMiddleware, toggleFollow);
router.post("/watchlist/:id", authMiddleware, toggleWatchlist);
router.post("/favorite/:id", authMiddleware, toggleFavorite);
export default router;
//# sourceMappingURL=user.routes.js.map