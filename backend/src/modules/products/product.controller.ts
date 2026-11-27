import type { NextFunction, Request, Response } from "express";
import { ProductService } from "./product.service";
import { NewProduct, UpdateProduct } from "./product.repository";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  public createProduct = async (
    req: Request<{}, {}, NewProduct>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProductById = async (
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const product = await this.productService.getProductById(
        req.params.productId,
      );

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProductBySlug = async (
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const product = await this.productService.getProductBySlug(
        req.params.slug,
      );

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (
    req: Request<{ productId: string }, {}, UpdateProduct>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(
        req.params.productId,
        req.body,
      );

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public archiveProduct = async (
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const product = await this.productService.archiveProduct(
        req.params.productId,
      );

      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  };
}
