import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "../generated/prisma/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
dotenv.config();
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.get("/", async (req, res) => {
    res.status(200).json({ message: "Kinomen API is working right now! over the internet.", status: true, code: 200, statusText: "OK", timestamp: new Date().toISOString(), usersCount: await prisma.user.count() });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}!`);
});
export { prisma };
//# sourceMappingURL=index.js.map