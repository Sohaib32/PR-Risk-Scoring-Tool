/**
 * Error types and type guards for the application
 */

/**
 * LLM API error with optional status code
 */
export interface LLMApiError extends Error {
  status?: number;
  response?: {
    status?: number;
  };
}

/**
 * Type guard to check if an error is an LLM API error
 */
export function isLLMApiError(error: unknown): error is LLMApiError {
  return (
    error instanceof Error &&
    (typeof (error as LLMApiError).status === "number" ||
      typeof (error as LLMApiError).response?.status === "number")
  );
}

/**
 * Type guard to check if error is a standard Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}

/**
 * Check if error indicates size/token limit exceeded
 */
export function isSizeLimitError(error: unknown): boolean {
  if (!isError(error)) {
    return false;
  }

  const errorMessage = error.message.toLowerCase();
  const hasLimitKeyword =
    errorMessage.includes("413") ||
    errorMessage.includes("request too large") ||
    errorMessage.includes("tokens per minute") ||
    errorMessage.includes("tpm") ||
    errorMessage.includes("too large");

  if (hasLimitKeyword) {
    return true;
  }

  // Check status codes
  if (isLLMApiError(error)) {
    const status = error.status ?? error.response?.status;
    return status === 413;
  }

  return false;
}
