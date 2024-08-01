import { Injectable } from '@nestjs/common';
import { ProductDbAdapter } from '../../adapters/product-db.adapter';
import { Product } from 'src/domain/entities/product.entity';

@Injectable()
export class ProductService {
  constructor(private readonly productDbAdapter: ProductDbAdapter) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productDbAdapter.getAllProducts();
  }

  async getProduct(productId: string): Promise<Product> {
    return await this.productDbAdapter.getProduct(productId);
  }

  async updateProduct(productId: string, stock: number): Promise<Product> {
    return await this.productDbAdapter.updateProduct(productId, stock);
  }
}
