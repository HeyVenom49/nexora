import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";

type HandledError = { statusCode: number; code: string; message: string };

// Errors thrown by express.json() (body-parser), keyed by their `type`.
const BODY_PARSER_ERRORS: Record<string, HandledError> = {
  "entity.parse.failed": {
    statusCode: 400,
    code: "INVALID_JSON",
    message: "Request body contains invalid JSON",
  },
  "entity.too.large": {
    statusCode: 413,
    code: "PAYLOAD_TOO_LARGE",
    message: "Request body is too large",
  },
};

const getErrorType = (err: unknown): string | undefined => {
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    typeof err.type === "string"
  ) {
    return err.type;
  }

  return undefined;
};

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, next) => {
  // The response has already started; let Express close the connection.
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  const errorType = getErrorType(err);
  const bodyParserError = errorType ? BODY_PARSER_ERRORS[errorType] : undefined;

  if (bodyParserError) {
    res.status(bodyParserError.statusCode).json({
      success: false,
      error: {
        code: bodyParserError.code,
        message: bodyParserError.message,
      },
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
};
