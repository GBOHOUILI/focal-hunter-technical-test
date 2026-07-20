const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not set — check your .env file");
}

export interface ProductListItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string;
  storeName: string;
}

export interface ProductDetail extends ProductListItem {
  description: string;
}

export interface SignupResponse {
  id: string;
  productId: string;
  email: string;
  status: "pending" | "sent" | "failed";
  createdAt: string;
}

// Thrown when the API responds with an error status — carries the parsed
// error body so callers (mutations, screens) can show the right message.
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? "Something went wrong"
    );
  }

  return response.json();
}

export async function fetchProducts(): Promise<ProductListItem[]> {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse<ProductListItem[]>(response);
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  return handleResponse<ProductDetail>(response);
}

export async function submitSignup(productId: string, email: string): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<SignupResponse>(response);
}
