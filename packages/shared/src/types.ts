/**
 * Shared domain types used by the API, the worker, and the mobile app.
 * Single source of truth for the shape of the data everyone exchanges.
 */

// A shop that sells products.
export interface Store {
  id: string;
  name: string;
  createdAt: string;
}

// A product sold in a store.
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // DB stores this differently, but this type is the shape after mapping
  currency: string;
  stock: number;
  imageUrl: string;
  storeId: string;
}

// Product + its store's name, for screens that display both together.
export interface ProductWithStore extends Product {
  storeName: string;
}

// Union type instead of plain string: blocks typos/invalid values at compile time.
export type SignupStatus = "pending" | "sent" | "failed";

// A user's request to be notified about a product ("Add to my list").
export interface Signup {
  id: string;
  productId: string;
  email: string;
  status: SignupStatus;
  createdAt: string;
}
