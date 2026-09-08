type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | string[] | number | number[] | boolean | null>;
};

class HttpClient {
  private baseUrl: string;
  private tokenKey: string;

  constructor(baseUrl: string, tokenKey: string = "session") {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.tokenKey = tokenKey;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.tokenKey);
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", headers = {}, body, params } = options;

    const defaultHeaders: Record<string, string> = {};

    const token = this.getAuthToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const isFormData = body instanceof FormData;

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method,
        headers: {
          ...defaultHeaders,
          ...(!isFormData ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      });
    } catch (err: any) {
      if (typeof window !== "undefined") {
        if (!window.navigator.onLine) {
          window.dispatchEvent(new Event("trigger-offline-modal"));
        } else {
          window.dispatchEvent(new Event("trigger-server-error-banner"));
        }
      }
      throw err;
    }

    if (!response.ok) {
      const errorData = await this.parseResponse(response);
      const error = new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      (error as any).response = { data: errorData };
      if (response.status >= 500 && typeof window !== "undefined") {
        window.dispatchEvent(new Event("trigger-server-error-banner"));
      }
      throw error;
    }

    return this.parseResponse(response);
  }

  private async parseResponse(response: Response) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  get<T>(endpoint: string, params?: RequestOptions["params"], options?: Omit<RequestOptions, "body" | "method" | "params">) {
    return this.request<T>(endpoint, { ...options, method: "GET", params });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "body" | "method">) {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "body" | "method">) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "body" | "method">) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, "method">) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Create an instance with the base URL from environment variables
export const httpClient = new HttpClient(process.env.NEXT_PUBLIC_API_URL || "");
