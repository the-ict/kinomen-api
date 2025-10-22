import {prisma} from "../index.js"
import { Router } from "express"
import { checkUsernameAvailability } from "../controllers/user.controllers.js"

const router = Router();

router.get("/check-username/:username", checkUsernameAvailability);

export default router;