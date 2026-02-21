import { ApiError } from "./errors";

export { ApiError };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/v1";
const API_URL = `${API_BASE_URL}${API_BASE_PATH}`;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions extends Omit<RequestInit, "method" | "body"> {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token, headers, ...init }: ApiRequestOptions = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      ...init,
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorBody: unknown;

      if (contentType?.includes("application/json")) {
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }
      } else {
        errorBody = await response.text();
      }

      const message =
        typeof errorBody === "string"
          ? errorBody || response.statusText
          : (errorBody as { message?: string })?.message || response.statusText;

      throw new ApiError(response.status, message, errorBody);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
}
