import { Database } from "../common/database/client";
import { ProductsRepository } from "./products.repository";
import { ProductsService } from "./products.service";
import { createProductsController } from "./products.controller";


export function createProductsModule(database: Database) {
  const repository = new ProductsRepository(database);
  const service = new ProductsService(repository);
  const router = createProductsController(service);

  return { router, service, repository };
}
