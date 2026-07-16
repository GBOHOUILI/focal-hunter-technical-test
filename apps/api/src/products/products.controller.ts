import { Router } from "express";
import { ProductsService } from "./products.service";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createProductsController(service: ProductsService): Router {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const items = await service.getAll();
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params

      if (!UUID_REGEX.test(id)) {
        res.status(400).json({
          error: { code: "INVALID_ID", message: "Product id must be a valid UUID" },
        });
        return;
      }

      const product = await service.getById(id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  })

  return router;
}
