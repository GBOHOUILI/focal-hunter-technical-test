import type { ProductRow } from "../products.repository";

// Shape sent to the mobile app for the list screen.
export interface ProductListItemDto {
  id: string;
  title: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl: string;
  storeName: string;
}

// List item + description, for the detail screen.
export interface ProductDetailDto extends ProductListItemDto {
  description: string;
}

export function toProductListItemDto(row: ProductRow): ProductListItemDto {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    currency: row.currency,
    stock: row.stock,
    imageUrl: row.imageUrl,
    storeName: row.storeName ?? "Magasin inconnu",
  };
}

export function toProductDetailDto(row: ProductRow): ProductDetailDto {
  return {
    ...toProductListItemDto(row),
    description: row.description,
  };
}
