import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../logger";

// Business error thrown on purpose by services/controllers.
// Lets us tell an "expected" error (404, 409...) apart from an unplanned bug (500).
export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = "HTTP_EXCEPTION"
  ) {
    super(message);
    this.name = "HttpException";
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Resource not found") {
    super(404, message, "NOT_FOUND");
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict on this resource") {
    super(409, message, "CONFLICT");
  }
}

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Single error-handling middleware for the whole app.
// Must be registered LAST in app.ts (4-argument signature is how Express
// recognizes an error handler, vs a normal middleware with 3 arguments).
export function httpExceptionFilter(
  err: unknown,
  req: Request,
  res: Response<ErrorResponseBody>,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid data",
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "An internal error occurred" },
  });
}
