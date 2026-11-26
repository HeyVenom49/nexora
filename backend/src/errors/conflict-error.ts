import { AppError } from "./app-error";

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", code = "RESOURCE_CONFLICT") {
    super(message, 409, code);
  }
}
