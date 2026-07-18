import { Router } from "express";
import { SignupsRepository } from "./signups.repository";
import { SignupsService } from "./signups.service";
import { createSignupsController } from "./signups.controller";
import { ProductsRepository } from "../products/products.repository";
import type { Database } from "../common/database/client";

export function createSignupsModule(
  database: Database,
  productsRepository: ProductsRepository
): { router: Router } {
  const repository = new SignupsRepository(database);
  const service = new SignupsService(repository, productsRepository);
  const router = createSignupsController(service);

  return { router };
}
