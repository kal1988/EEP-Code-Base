const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
console.log("Frontend API_URL:", API_URL);

async function fetcher(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = new Headers(options.headers);
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (!token && methodIsAuthRequired(endpoint, options)) {
     throw new Error("Authentication token missing. Please log in again.");
  }

  function methodIsAuthRequired(ep: string, opts: any) {
    if (ep === "/token" || ep === "/register") return false;
    if (ep === "/organization/" && (opts.method === "GET" || !opts.method)) return false;
    return true; // Default to requiring auth for everything else
  }

  // Set default Content-Type to application/json if not already set and not FormData
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // If it IS FormData, we MUST NOT set Content-Type (let the browser do it)
  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  }

  const finalHeaders: any = {};
  headers.forEach((value, key) => {
    finalHeaders[key] = value;
  });

  // Log only the first few characters of the token for safety
  if (token) {
    console.log(`Sending request to ${endpoint} with token: ${token.substring(0, 10)}...`);
  } else {
    console.warn(`Sending request to ${endpoint} WITHOUT token`);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: finalHeaders,
    });
  } catch (e: any) {
    console.error(`CRITICAL CONNECTION ERROR for ${endpoint}:`, e.message);
    // Return a mock response that allows .json() to succeed but returns empty data
    return (endpoint.endsWith('/') || endpoint.includes('employees') || endpoint.includes('departments') || endpoint.includes('positions')) ? [] : {};
  }

  if (!response.ok) {
    let errorMessage = "Something went wrong";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // Not JSON
    }
    console.error(`API Error on ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (e) {
    console.error(`FAILED TO PARSE JSON for ${endpoint}`);
    return {};
  }
}

export const api = {
  get: (endpoint: string) => fetcher(endpoint, { method: "GET" }),
  post: (endpoint: string, data: any) => {
    const isFormData = data instanceof FormData;
    return fetcher(endpoint, { 
      method: "POST", 
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  put: (endpoint: string, data: any) => fetcher(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: (endpoint: string, data: any) => {
    const isFormData = data instanceof FormData;
    return fetcher(endpoint, { 
      method: "PATCH", 
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  delete: (endpoint: string) => fetcher(endpoint, { method: "DELETE" }),
  
  login: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/token`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  }
};
