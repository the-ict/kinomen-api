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
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        imageUrl: true,
                    },
                },
            },
        });
        return res.status(201).json({ message: "Post created", post });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create post" });
    }
};
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
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        imageUrl: true,
                    },
                },
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
const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        imageUrl: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                        replies: {
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrl: true,
                                    },
                                },
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
            updates.published = req.body.published;
        const updated = await prisma.post.update({
            where: { id: Number(id) },
            data: updates,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        imageUrl: true,
                    },
                },
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
const getMostDiscussedPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        imageUrl: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });
        const sortedPosts = posts
            .map(post => ({
            ...post,
            commentCount: post._count.comments,
            likesCount: post.likes.length,
            viewCount: post.view.length,
        }))
            .sort((a, b) => {
            if (b.commentCount !== a.commentCount)
                return b.commentCount - a.commentCount;
            if (b.likesCount !== a.likesCount)
                return b.likesCount - a.likesCount;
            return b.viewCount - a.viewCount;
        })
            .slice(0, 10);
        return res.status(200).json(sortedPosts);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch most discussed posts" });
    }
};
const getMyPosts = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Unauthorized" });
        const posts = await prisma.post.findMany({
            where: { authorId: user.id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(posts);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch user's posts" });
    }
};
const searchPostsByMovie = async (req, res) => {
    try {
        const { movieName } = req.body;
        console.log(movieName, "moviename");
        if (!movieName) {
            return res.status(400).json({ message: "Movie name is required" });
        }
        const posts = await prisma.post.findMany({
            where: {
                movie: {
                    contains: movieName,
                    mode: 'insensitive'
                },
                published: true
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        imageUrl: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({
            message: `Found ${posts.length} posts for movie "${movieName}"`,
            posts,
            count: posts.length
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to search posts by movie" });
    }
};
export { createPost, getPosts, getPost, updatePost, deletePost, toggleLike, getMostDiscussedPosts, getMyPosts, searchPostsByMovie };
//# sourceMappingURL=post.controllers.js.map