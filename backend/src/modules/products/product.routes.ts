import { Router } from "express";
import { ProductRepository } from "./product.repository";
import { db } from "../../db";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateParams } from "../../middlewares/validate-params.middleware";
import {
  createProductBodySchema,
  getProductBySlugParamsSchema,
  getProductParamsSchema,
  updateProductBodySchema,
} from "./product.validation";
import { requirePermission } from "../../middlewares/permission.middleware";
import { validateBody } from "../../middlewares/validate-body.middleware";

const router = Router();

const productRepository = new ProductRepository(db);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get(
  "/:productId",
  authenticate,
  requirePermission("product:read"),
  validateParams(getProductParamsSchema),
  productController.getProductById,
);

router.get(
  "/slug/:slug",
  authenticate,
  requirePermission("product:read"),
  validateParams(getProductBySlugParamsSchema),
  productController.getProductBySlug,
);

router.post(
  "/",
  authenticate,
  requirePermission("product:create"),
  validateBody(createProductBodySchema),
  productController.createProduct,
);

router.patch(
  "/:productId",
  authenticate,
  requirePermission("product:update"),
  validateParams(getProductParamsSchema),
  validateBody(updateProductBodySchema),
  productController.updateProduct,
);

router.patch(
  "/:productId/archive",
  authenticate,
  requirePermission("product:archive"),
  validateParams(getProductParamsSchema),
  productController.archiveProduct,
);

export default router;
