const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/+$/,
  "",
);

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    let message = body;
    try {
      const problem: unknown = JSON.parse(body);
      if (problem && typeof problem === "object") {
        const detail = Reflect.get(problem, "detail");
        const title = Reflect.get(problem, "title");
        if (typeof detail === "string") message = detail;
        else if (typeof title === "string") message = title;
      }
    } catch {
      // Non-JSON error bodies are returned as plain text by some API actions.
    }
    throw new Error(message || `Request failed with status ${response.status}.`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
