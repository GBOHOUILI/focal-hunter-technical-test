import express from "express";
import cors from "cors";
import { httpExceptionFilter } from "./common/filters/http-exception.filter";
import { createProductsModule } from "./products/products.module";
import { db } from "./common/database/client";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const { router: productsRouter } = createProductsModule(db);
  app.use("/products", productsRouter);

  // 404 for any unmatched route
  app.use((req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });

  // Must stay last — Express recognizes it as an error handler by its 4-argument signature.
  app.use(httpExceptionFilter);

  return app;
}
