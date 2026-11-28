import { ConflictError } from "../../errors/conflict-error";
import { NotFoundError } from "../../errors/not-found-error";
import { ProductRepository } from "./product.repository";
import type { NewProduct, UpdateProduct } from "./product.repository";

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  public async createProduct(input: NewProduct) {
    const slugExists = await this.productRepository.existsBySlug(input.slug);

    if (slugExists) {
      throw new ConflictError(
        "Product slug already exists",
        "PRODUCT_SLUG_ALREADY_EXISTS",
      );
    }

    try {
      return await this.productRepository.create(input);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictError(
          "Product slug already exists",
          "PRODUCT_SLUG_ALREADY_EXISTS",
        );
      }
      throw error;
    }
  }

  public async getProductById(productId: string) {
    const product = await this.productRepository.findById(productId);

    if (!product || product.status === "archived") {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    return product;
  }

  public async getProductBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);

    if (!product || product.status === "archived") {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    return product;
  }

  public async updateProduct(productId: string, input: UpdateProduct) {
    const existingProduct = await this.productRepository.findById(productId);

    if (!existingProduct) {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    if (existingProduct.status === "archived") {
      throw new ConflictError(
        "Product is archived and cannot be updated",
        "PRODUCT_ALREADY_ARCHIVED",
      );
    }

    if (input.slug !== undefined && input.slug !== existingProduct.slug) {
      const slugExists = await this.productRepository.existsBySlug(input.slug);

      if (slugExists) {
        throw new ConflictError(
          "Product slug already exists",
          "PRODUCT_SLUG_ALREADY_EXISTS",
        );
      }
    }

    try {
      const updateProduct = await this.productRepository.updateById(
        productId,
        input,
      );

      if (!updateProduct) {
        throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
      }

      return updateProduct;
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new ConflictError(
          "Product slug already exists",
          "PRODUCT_SLUG_ALREADY_EXISTS",
        );
      }

      throw error;
    }
  }

  public async archiveProduct(productId: string) {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundError("Product not found", "PRODUCT_NOT_FOUND");
    }

    if (product.status === "archived") {
      throw new ConflictError(
        "Product is already archived",
        "PRODUCT_ALREADY_ARCHIVED",
      );
    }

    const archivedProduct = await this.productRepository.archiveById(productId);

    if (!archivedProduct) {
      throw new ConflictError(
        "Product is already archived",
        "PRODUCT_ALREADY_ARCHIVED",
      );
    }

    return archivedProduct;
  }
}
