// lib/api.js
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/users";

/**
 * Generic API request helper
 * Automatically includes credentials (cookies)
 */
async function apiRequest(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    ...options,
    credentials: "include", // send cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

export const api = {
  post: (endpoint, body) =>
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) }),
  get: (endpoint) => apiRequest(endpoint),
};
