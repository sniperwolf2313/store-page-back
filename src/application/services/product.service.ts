import { Injectable } from '@nestjs/common';
import { ProductDbAdapter } from '../../adapters/product-db.adapter';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../../utils/result';

@Injectable()
export class ProductService {
  constructor(private readonly productDbAdapter: ProductDbAdapter) {}

  async getAllProducts(): Promise<Result<Product[]>> {
    const productsResult = await this.productDbAdapter.getAllProducts();
    if (!productsResult.isSuccess) {
      return Result.fail(new Error('Failed to retrieve products'));
    }
    return Result.ok(productsResult.value);
  }

  async getProduct(productId: string): Promise<Result<Product>> {
    const productResult = await this.productDbAdapter.getProduct(productId);
    if (!productResult.isSuccess) {
      return Result.fail(new Error('Product not found'));
    }
    return Result.ok(productResult.value);
  }

  async updateProduct(
    productId: string,
    stock: number,
  ): Promise<Result<Product>> {
    const updateResult = await this.productDbAdapter.updateProduct(
      productId,
      stock,
    );
    if (!updateResult.isSuccess) {
      return Result.fail(new Error('Failed to update product'));
    }
    return Result.ok(updateResult.value);
  }
}
