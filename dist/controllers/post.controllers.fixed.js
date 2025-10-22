import { prisma } from "../index.js";
const createPost = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        const { title, content, movie, rating, imageUrl } = req.body;
        if (!title || !movie || !rating) {
            return res.status(400).json({ message: "Title, movie and rating are required" });
        }
        const post = await prisma.post.create({
            data: {
                title,
                content,
                movie,
                rating: Number(rating),
                imageUrl,
                authorId: user.id,
            },
            include: {
                author: true,
            },
        });
        return res.status(201).json({ message: "Post created", post });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create post" });
    }
};
// Get all posts with optional filters
const getPosts = async (req, res) => {
    try {
        const { authorId, published } = req.query;
        const where = {};
        if (authorId)
            where.authorId = Number(authorId);
        if (published !== undefined)
            where.published = published === "true";
        const posts = await prisma.post.findMany({
            where,
            include: {
                author: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(posts);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch posts" });
    }
};
// Get single post by id
const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                author: true,
                comments: {
                    include: {
                        author: true,
                        replies: {
                            include: {
                                author: true,
                            },
                        },
                    },
                },
            },
        });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        // Increment view count if viewer ID not in views
        const viewerId = req.user?.id;
        if (viewerId && !post.view.includes(String(viewerId))) {
            await prisma.post.update({
                where: { id: Number(id) },
                data: { view: { push: String(viewerId) } },
            });
        }
        return res.status(200).json(post);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch post" });
    }
};
// Update a post
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        const post = await prisma.post.findUnique({ where: { id: Number(id) } });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        if (post.authorId !== user.id) {
            return res.status(403).json({ message: "Cannot update other user's posts" });
        }
        const updates = {};
        if (req.body.title !== undefined)
            updates.title = req.body.title;
        if (req.body.content !== undefined)
            updates.content = req.body.content;
        if (req.body.movie !== undefined)
            updates.movie = req.body.movie;
        if (req.body.rating !== undefined)
            updates.rating = Number(req.body.rating);
        if (req.body.imageUrl !== undefined)
            updates.imageUrl = req.body.imageUrl;
        if (req.body.published !== undefined)
            updates.published = Boolean(req.body.published);
        const updated = await prisma.post.update({
            where: { id: Number(id) },
            data: updates,
            include: {
                author: true,
            },
        });
        return res.status(200).json({ message: "Post updated", post: updated });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update post" });
    }
};
// Delete a post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        const post = await prisma.post.findUnique({ where: { id: Number(id) } });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        if (post.authorId !== user.id) {
            return res.status(403).json({ message: "Cannot delete other user's posts" });
        }
        await prisma.post.delete({ where: { id: Number(id) } });
        return res.status(200).json({ message: "Post deleted" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete post" });
    }
};
// Like/unlike a post
const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        const post = await prisma.post.findUnique({ where: { id: Number(id) } });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        const userId = String(user.id);
        const liked = post.likes.includes(userId);
        const updated = await prisma.post.update({
            where: { id: Number(id) },
            data: {
                likes: liked
                    ? { set: post.likes.filter(id => id !== userId) }
                    : { push: userId },
            },
        });
        // Update user's liked posts list
        await prisma.user.update({
            where: { id: user.id },
            data: {
                liked: liked
                    ? { set: post.likes.filter(id => id !== String(post.id)) }
                    : { push: String(post.id) },
            },
        });
        return res.status(200).json({
            message: liked ? "Post unliked" : "Post liked",
            likes: updated.likes,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to toggle like" });
    }
};
export { createPost, getPosts, getPost, updatePost, deletePost, toggleLike };
//# sourceMappingURL=post.controllers.fixed.js.map