import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./error";

export interface CustomRequest extends Request {
    body: any;
    params: any;
    query: any;
    cookies: any;
    app: any;
    user?: {
        _id: string;
        username: string;
        email: string;
        name: string;
    };
    tokenPayload?: {
        iat: number;
        exp: number;
    };
}

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token || req.cookies.refresh_token;

    if (!token) {
        return next(errorHandler(401, "Access denied. No token provided"));
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        return next(errorHandler(500, "Server error, missing JWT secret key"));
    }

    try {
        const decoded = jwt.verify(token, secretKey) as JwtPayload & {
            _id: string;
            username: string;
            email: string;
            name: string;
            iat: number;
            exp: number;
        };

        // Assign user data to req.user
        req.user = {
            _id: decoded._id,
            username: decoded.username,
            email: decoded.email,
            name: decoded.name,
        };

        // Optional: Assign token metadata if needed
        req.tokenPayload = { iat: decoded.iat, exp: decoded.exp };
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return next(errorHandler(400, "Invalid or expired token"));
    }
};

export default verifyToken;
