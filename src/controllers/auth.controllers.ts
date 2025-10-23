import type { Request, Response } from "express";
import { prisma } from "../index.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

const register = async (req: Request, res: Response) => {
  try {
    const { password, email, ...rest } = req.body;

    console.log(email, password, rest);

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        ...rest,
      },
    });

    if (!user) return res.status(400).json({ message: "User not created" });

    const token = generateToken({
      id: (user as any).id,
      email: (user as any).email,
    });

    // Omit password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, ...safeUser } = user as any;

    return res
      .status(201)
      .json({ message: "User created", user: safeUser, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to register user" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    const u: any = user;
    if (!u || !u.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const valid = bcrypt.compareSync(password, u.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken({ id: u.id, email: u.email });

    const { password: _p, ...safeUser } = u as any;

    return res
      .status(200)
      .json({ message: "Login successful", user: safeUser, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to login user" });
  }
};

export { register, login };
