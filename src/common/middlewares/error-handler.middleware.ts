// @middlewares/error-handler.middleware.ts
import { ApiError } from "@helper/api-error.helper";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { statusCode } from "@messages";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);
  
  // Handle JSON parse errors (SyntaxError from body-parser)
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    return res.status(statusCode.BadRequest).json({
      statusCode: statusCode.BadRequest,
      success: false,
      message: "Invalid JSON format in request body. Please check for extra quotes or trailing commas.",
      data: null,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const message = err.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");

    return res.status(statusCode.BadRequest).json({
      statusCode: statusCode.BadRequest,
      success: false,
      message: message || "Validation failed",
      data: null,
    });
  }

  // Handle your custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.errorMessage,
      data: err.data,
    });
  }

  // Any other error
  return res.status(statusCode.InternalServerError).json({
    statusCode: statusCode.InternalServerError,
    success: false,
    message: "Internal server error",
    data: null,
  });
};