import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function generateToken(payload: Record<string, any>) {
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn: JWT_EXPIRES_IN } as any) as string;
}

export function verifyToken(token: string) {
  return jwt.verify(token as any, JWT_SECRET as any) as any;
}
