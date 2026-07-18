import { Router } from "express";
import { SignupsService } from "./signups.service";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createSignupsController(service: SignupsService): Router {
  const router = Router();

  router.post("/:id/signup", async (req, res, next) => {
    try {
      const { id: productId } = req.params;

      if (!UUID_REGEX.test(productId)) {
        res.status(400).json({
          error: { code: "INVALID_ID", message: "Product id must be a valid UUID" },
        });
        return;
      }

      const signup = await service.createSignup(productId, req.body);
      res.status(201).json(signup);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
