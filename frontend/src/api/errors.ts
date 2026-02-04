export async function parseApiError(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const data = await res.json();
      if (typeof data === "string") return data;
      if (data && typeof data === "object") {
        if (typeof data.detail === "string") return data.detail;

        const parts: string[] = [];
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) {
            parts.push(`${key}: ${value.join(", ")}`);
          } else if (typeof value === "string") {
            parts.push(`${key}: ${value}`);
          }
        }
        if (parts.length > 0) return parts.join(" | ");
      }
    } catch {
      // fall through to text below
    }
  }

  try {
    return (await res.text()) || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
