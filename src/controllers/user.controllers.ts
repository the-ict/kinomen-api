import type { Request, Response } from "express";
import { prisma } from "../index.js";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../middlewares/jwt.middleware.js";

// Get user profile
const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        posts: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { password: _p, ...safeUser } = user;
    return res.status(200).json(safeUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

// Update user profile
const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req.user as any;

    if (!requester || String(requester.id) !== String(id)) {
      return res.status(403).json({ message: "Forbidden: cannot update this user" });
    }

    const updates: any = { ...req.body };
    if (updates.password) updates.password = bcrypt.hashSync(updates.password, 10);

    const allowed = {
      email: updates.email,
      name: updates.name,
      about: updates.about,
      password: updates.password,
      coverImage: updates.coverImage,
      imageUrl: updates.imageUrl,
    };

    const user = await prisma.user.update({ where: { id: Number(id) }, data: allowed });
    const { password: _p, ...safeUser } = user;
    return res.status(200).json({ message: "User updated", user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

// Delete user account
const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req.user as any;

    if (!requester || String(requester.id) !== String(id)) {
      return res.status(403).json({ message: "Forbidden: cannot delete this user" });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

// Follow/unfollow a user
const toggleFollow = async (req: AuthRequest, res: Response) => {
  try {
    const { id: targetId } = req.params; // ID of user to follow/unfollow
    const follower = req.user as any;
    if (!follower) return res.status(401).json({ message: "Unauthorized" });
    if (String(follower.id) === String(targetId)) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const target = await prisma.user.findUnique({ where: { id: Number(targetId) } });
    if (!target) return res.status(404).json({ message: "User not found" });

    const isFollowing = target.followers.includes(String(follower.id));

    // Update target's followers
    const updatedTarget = await prisma.user.update({
      where: { id: Number(targetId) },
      data: {
        followers: isFollowing
          ? { set: target.followers.filter(id => id !== String(follower.id)) }
          : { push: String(follower.id) }
      }
    });

    // Update follower's following list
    const currentUser = await prisma.user.findUnique({ where: { id: follower.id } });
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });

    await prisma.user.update({
      where: { id: follower.id },
      data: {
        followings: isFollowing
          ? { set: currentUser.followings.filter(id => id !== String(targetId)) }
          : { push: String(targetId) }
      }
    });

    return res.status(200).json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      followers: updatedTarget.followers
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to toggle follow" });
  }
};

// Add/remove from watchlist
const toggleWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const { id: postId } = req.params;
    const user = req.user as any;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const post = await prisma.post.findUnique({ where: { id: Number(postId) } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const inWatchlist = currentUser.watchlist.includes(String(postId));

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        watchlist: inWatchlist
          ? { set: currentUser.watchlist.filter(id => id !== String(postId)) }
          : { push: String(postId) }
      }
    });

    return res.status(200).json({
      message: inWatchlist ? "Removed from watchlist" : "Added to watchlist",
      watchlist: updated.watchlist
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update watchlist" });
  }
};

const checkUsernameAvailability = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    const isValid = !user; // If user exists, username is taken (invalid), else available (valid)
    return res.status(200).json({ valid: isValid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to check username availability" });
  }
};

export {
  getProfile,
  updateUser,
  deleteUser,
  toggleFollow,
  toggleWatchlist,
  checkUsernameAvailability
};
