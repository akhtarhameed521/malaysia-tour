import { Request, Response, NextFunction } from "express";
import { ApiError } from "@helper/api-error.helper";
import { ErrorResponse, statusCode } from "@messages";
import { jwtVerify } from "@helper/auth.helper";
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const normalizedUrl = req.originalUrl.split("?")[0].replace(/\/$/, "");
  const publicRoutes = ["/api/users/signup", "/api/users/login"];
  if (publicRoutes.includes(normalizedUrl)) {
    return next();
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    throw new ApiError(statusCode.UnAuthorized, ErrorResponse.unAuthorized);
  }
  try {
    const decoded = jwtVerify(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError(statusCode.UnAuthorized, "Invalid or expired token");
  }
};