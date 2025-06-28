import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return void res.status(400).json({
        error: "Validation failed.",
        details: result.error.flatten().fieldErrors,
      });
    }

    // Replace req.body with the parsed & typed data
    req.body = result.data;
    next();
  };
};