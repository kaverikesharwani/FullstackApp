
type FetchOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    body?: any
    headers?: Record<string, string>
}

type ApiError = {
    message: string
    status: number
    statusText: string
}

class ApiClient {
    private baseUrl: string

    constructor(baseUrl: string = "/api") {
        this.baseUrl = baseUrl
    }

    private async fetch<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const { method = "GET", body, headers = {} } = options

        const config: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        }

        // Only add body for methods that support it
        if (body && method !== "GET") {
            config.body = JSON.stringify(body)
        }

        try {
            const response = await fetch(
                `${this.baseUrl}${endpoint}`,
                config
            )

            if (!response.ok) {
                const errorText = await response.text()
                const error: ApiError = {
                    message: errorText || response.statusText,
                    status: response.status,
                    statusText: response.statusText,
                }
                throw error
            }

            // Handle empty responses (204 No Content)
            if (response.status === 204) {
                return undefined as T
            }

            return response.json()
        } catch (error) {
            if (error && typeof error === "object" && "status" in error) {
                throw error // Re-throw ApiError
            }
            // Handle network errors
            throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
    }

    // Convenience methods
    async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.fetch<T>(endpoint, { method: "GET", headers })
    }

    async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
        return this.fetch<T>(endpoint, { method: "POST", body, headers })
    }

    async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
        return this.fetch<T>(endpoint, { method: "PUT", body, headers })
    }

    async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.fetch<T>(endpoint, { method: "DELETE", headers })
    }

    async patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
        return this.fetch<T>(endpoint, { method: "PATCH", body, headers })
    }
}

export default ApiClient