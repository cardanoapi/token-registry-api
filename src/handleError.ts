export type APIError =
  | { message: string; data: string; status: number }
  | { message: string; url: string; status: number };

const ErrorStatusCodes = {
  ERR_FR_TOO_MANY_REDIRECTS: 310,
  ERR_BAD_OPTION_VALUE: 400,
  ERR_BAD_OPTION: 400,
  ERR_NETWORK: 503,
  ERR_DEPRECATED: 410,
  ERR_BAD_RESPONSE: 502,
  ERR_BAD_REQUEST: 400,
  ERR_NOT_SUPPORT: 415,
  ERR_INVALID_URL: 400,
  ERR_CANCELED: 499,
  ECONNABORTED: 408,
  ETIMEDOUT: 408,
};

export async function handleApiError<T>(
  promiseFactory: () => Promise<T>,
  log: string,
  maxRetries = 1,
  delayMs = 500
): Promise<T | APIError> {
  let attempt = 0;
  let errorMessage: APIError = { message: "unknown", data: "", status: 0 };
  while (attempt <= maxRetries) {
    try {
      const result = await promiseFactory();
      if (attempt != 0) {
        console.log(`${log} ✅ Request succeeded on attempt ${attempt + 1}`);
      }
      return result;
    } catch (error: any) {
      attempt++;

      if (error.response) {
        console.log(`${log} ❌ Attempt ${attempt}/${maxRetries} failed:`);
        console.log("Response Data:", error.response.data);
        console.log("Response Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        errorMessage = {
          message: "Response Error",
          data: error.response.data,
          status: error.response.status,
        };
      } else if (error.request) {
        console.log(
          `${log} ❌ Attempt ${attempt}/${maxRetries} failed: Request sent but no response received. [ERROR]: ${
            error.code
          }. ${
            error.request._currentUrl
              ? `Request URL: ${error.request._currentUrl}`
              : ""
          }`
        );
        errorMessage = {
          message: "Request Error",
          status:
            ErrorStatusCodes[error.code as keyof typeof ErrorStatusCodes] ||
            500,
          url: error.request._currentUrl,
        };
      } else {
        console.log(
          `${log} ❌ Attempt ${attempt}/${maxRetries} failed: Error:`,
          error.message
        );
      }

      // Stop retrying if max retries are reached
      if (attempt > maxRetries) {
        console.log(`${log} ⛔ Max retries reached. Giving up.`);
        return errorMessage;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return errorMessage; // Should never reach here, but just in case
}

export function isApiError(data: any): boolean {
  if (data === null || data === undefined) {
    return false;
  }
  if (typeof data == "object") {
    const keys = Object.keys(data);
    if (keys.length === 3) {
      if (
        keys.includes("message") &&
        keys.includes("status") &&
        (keys.includes("data") || keys.includes("url"))
      ) {
        return true;
      }
    }
  }
  return false;
}

export function apiError(message: string, data: any, status: number): APIError {
  return {
    message: message,
    data: data,
    status: status,
  };
}
