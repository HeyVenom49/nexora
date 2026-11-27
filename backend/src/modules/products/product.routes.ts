import { Router } from "express";
import { ProductRepository } from "./product.repository";
import { db } from "../../db";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateParams } from "../../middlewares/validate-params.middleware";
import {
  getProductBySlugParamsSchema,
  getProductParamsSchema,
} from "./product.validation";

const router = Router();

const productRepository = new ProductRepository(db);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.get(
  "/:productId",
  authenticate,
  validateParams(getProductParamsSchema),
  productController.getProductById,
);

router.get(
  "/slug/:slug",
  authenticate,
  validateParams(getProductBySlugParamsSchema),
  productController.getProductBySlug,
);

export default router;
