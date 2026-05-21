import jwt from "jsonwebtoken";

const getSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    return secret;
};

export const generateToken = (userId: string, expiresIn: string = "10h"): string => {
    const options: jwt.SignOptions = { expiresIn: expiresIn as any };
    return jwt.sign({ id: userId }, getSecret(), options);
};

export const verifyToken = (token: string): { id: string } => {
    return jwt.verify(token, getSecret()) as { id: string };
};
