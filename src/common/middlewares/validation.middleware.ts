// import { z, ZodError } from "zod";
// import { Request, Response, NextFunction } from "express";
// import { ApiError } from "@helper/api-error.helper";
// import { statusCode } from "@messages";


// export const validateRequest = <T extends z.ZodTypeAny>(schema: T) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const validatedData = await schema.parseAsync(req.body);
//       req.body = validatedData;
//       next();
//     } catch (error) {
//       if (error instanceof ZodError) {
//         const errorMessages = error.issues.map((issue) => {
//           if (issue.code === z.ZodIssueCode.unrecognized_keys) {
//             return `${issue.keys.join(", ")} should not exist`;
//           }
//           return `${issue.path.join(".")}: ${issue.message}`; // Include field path
//         });
//         console.log("Validation errors:", error);
//         return next(new ApiError(statusCode.BadRequest, errorMessages));
//       }
//       next(error);
//     }
//   };
// };


import { z, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "@helper/api-error.helper";
import { statusCode } from "@messages";

export const validateRequest = <T extends z.ZodTypeAny>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        let errorMessages: string[] = [];

        error.issues.forEach((issue) => {
          // Handle discriminatedUnion discriminator errors
          if ((issue.code as any) === "invalid_union_discriminator") {
            const options = (issue as any).options?.join(", ") || "unknown";
            errorMessages.push(`${issue.path.join(".")}: Invalid type. Expected one of: ${options}`);
          // Flatten union errors for clearer feedback
          } else if (issue.code === "invalid_union" && "errors" in issue) {
            (issue.errors as any[]).forEach((iteration) => {
              const issues = iteration.issues || iteration;
              issues.forEach((innerErr: any) => {
                errorMessages.push(`${innerErr.path.join(".")}: ${innerErr.message}`);
              });
            });
          } else if (issue.code === z.ZodIssueCode.unrecognized_keys) {
            errorMessages.push(`${issue.keys.join(", ")} should not exist`);
          } else {
            errorMessages.push(`${issue.path.join(".")}: ${issue.message}`);
          }
        });

        console.log("Validation errors:", error);

        const primaryErrorMessage =
          errorMessages.length > 0 ? errorMessages.join(", ") : "Validation failed";

        return next(new ApiError(statusCode.BadRequest, primaryErrorMessage));
      }
      next(error);
    }
  };
};
