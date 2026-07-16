import { describe, it, expect, vi } from "vitest";
import { ProductsService } from "./products.service";
import { ProductsRepository, ProductRow } from "./products.repository";

// Fake row shaped exactly like what the repository would return after the leftJoin.
function makeFakeRow(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Fake Product",
    description: "A product used only in tests.",
    price: 1000,
    currency: "XOF",
    stock: 5,
    imageUrl: "http://example.com/fake.jpg",
    storeId: "22222222-2222-2222-2222-222222222222",
    createdAt: new Date(),
    storeName: "Fake Store",
    ...overrides,
  };
}

describe("ProductsService", () => {
  it("getAll returns products mapped to list DTOs", async () => {
    const fakeRepository = {
      findAll: vi.fn().mockResolvedValue([makeFakeRow()]),
      findById: vi.fn(),
      exists: vi.fn(),
    } as unknown as ProductsRepository;

    const service = new ProductsService(fakeRepository);
    const result = await service.getAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "11111111-1111-1111-1111-111111111111",
      title: "Fake Product",
      price: 1000,
      currency: "XOF",
      stock: 5,
      imageUrl: "http://example.com/fake.jpg",
      storeName: "Fake Store",
    });
    // description must NOT be in the list DTO
    expect(result[0]).not.toHaveProperty("description");
  });

  it("getById throws NotFoundException when the product does not exist", async () => {
    const fakeRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      exists: vi.fn(),
    } as unknown as ProductsRepository;

    const service = new ProductsService(fakeRepository);

    await expect(service.getById("does-not-exist")).rejects.toThrow("Product does-not-exist not found");
  });

  it("getById returns the full detail DTO when the product exists", async () => {
    const fakeRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(makeFakeRow({ storeName: null })),
      exists: vi.fn(),
    } as unknown as ProductsRepository;

    const service = new ProductsService(fakeRepository);
    const result = await service.getById("11111111-1111-1111-1111-111111111111");

    expect(result.description).toBe("A product used only in tests.");
    // storeName was null on the row -> service must fall back to a default label
    expect(result.storeName).toBe("Magasin inconnu");
  });
});
