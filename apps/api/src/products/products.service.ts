import { ProductsRepository } from "./products.repository";
import { NotFoundException } from "../common/filters/http-exception.filter";
import { toProductListItemDto, toProductDetailDto, ProductListItemDto, ProductDetailDto } from "./dto/product-response.dto";

export class ProductsService {
  constructor(private readonly repository: ProductsRepository) {}

  async getAll(): Promise<ProductListItemDto[]> {
    const rows = await this.repository.findAll();
    return rows.map(toProductListItemDto);
  }

  async getById(id: string): Promise<ProductDetailDto> {
    const row = await this.repository.findById(id);

    if (!row) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return toProductDetailDto(row);
  }
}
