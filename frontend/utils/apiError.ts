import { ApiError } from "open-api";

/** Backend errors carry a human-readable `message` in the response body (see GlobalExceptionHandler). */
export const getApiErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string } | undefined;
    return body?.message || err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
};
