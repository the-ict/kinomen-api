import type { Request, Response } from "express";
import { prisma } from "../index.js";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../middlewares/jwt.middleware.js";

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

const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const requester = req.user as any;

    if (!requester || String(requester.id) !== String(id)) {
      return res.status(403).json({ message: "Forbidden: cannot update this user" });
    }

    const updates: any = { ...req.body };
    console.log(updates, "updates console");
    if (updates.password) updates.password = bcrypt.hashSync(updates.password, 10);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files.profileImage && files.profileImage[0]) {
      updates.imageUrl = `/uploads/${files.profileImage[0].filename}`;
    }
    if (files.coverImage && files.coverImage[0]) {
      updates.coverImage = `/uploads/${files.coverImage[0].filename}`;
    }

    const allowed = {
      email: updates.email,
      name: updates.name,
      username: updates.username,
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

const toggleFollow = async (req: AuthRequest, res: Response) => {
  try {
    const { id: targetId } = req.params;
    const follower = req.user as any;
    if (!follower) return res.status(401).json({ message: "Unauthorized" });
    if (String(follower.id) === String(targetId)) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const target = await prisma.user.findUnique({ where: { id: Number(targetId) } });
    if (!target) return res.status(404).json({ message: "User not found" });

    const isFollowing = target.followers.includes(String(follower.id));

    const updatedTarget = await prisma.user.update({
      where: { id: Number(targetId) },
      data: {
        followers: isFollowing
          ? { set: target.followers.filter(id => id !== String(follower.id)) }
          : { push: String(follower.id) }
      }
    });

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
    console.log(username)
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if(!user) {
      return res.status(200).json({valid: false});
    }

    const isValid = !user;
    return res.status(200).json({ valid: isValid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to check username availability" });
  }
};

const getUserFollows = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        username: true,
        imageUrl: true,
        followers: true,
        followings: true
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const followers = await prisma.user.findMany({
      where: { id: { in: user.followers.map(id => Number(id)) } },
      select: {
        id: true,
        name: true,
        username: true,
        imageUrl: true
      }
    });

    const followings = await prisma.user.findMany({
      where: { id: { in: user.followings.map(id => Number(id)) } },
      select: {
        id: true,
        name: true,
        username: true,
        imageUrl: true
      }
    });

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        imageUrl: user.imageUrl
      },
      followers,
      followings,
      followersCount: followers.length,
      followingsCount: followings.length
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch user follows" });
  }
};

export {
  getProfile,
  getMyProfile,
  updateUser,
  deleteUser,
  toggleFollow,
  toggleWatchlist,
  checkUsernameAvailability,
  getUserFollows
};
