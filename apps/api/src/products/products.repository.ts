import { eq } from "drizzle-orm";
import { db } from "../common/database/client";
import { products, stores } from "../common/database/schema";
import type { Database } from "../common/database/client";

// shape of one row after the leftjoin:products columns + the store's name only.

export interface ProductRow {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string;
  storeId: string;
  createdAt: Date;
  storeName: string | null;
}


export class ProductsRepository {
  constructor(private readonly database: Database = db) { }

  // find all products
  async findAll(): Promise<ProductRow[]> {
    const rows = await this.database
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        currency: products.currency,
        stock: products.stock,
        imageUrl: products.imageUrl,
        storeId: products.storeId,
        createdAt: products.createdAt,
        storeName: stores.name,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
      .orderBy(products.createdAt);

    return rows;
  }

  // find Product by ID
  async findById(id: string): Promise<ProductRow | null> {
    const rows = await this.database
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        currency: products.currency,
        stock: products.stock,
        imageUrl: products.imageUrl,
        storeId: products.storeId,
        createdAt: products.createdAt,
        storeName: stores.name,
      })
      .from(products)
      .leftJoin(stores, eq(products.storeId, stores.id))
      .where(eq(products.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  // verify if exists
  async exists(id: string): Promise<boolean> {
    const rows = await this.database
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return rows.length > 0;
  }
}
