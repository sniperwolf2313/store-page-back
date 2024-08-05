import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ProductService } from '../application/services/product.service';
import { Product } from '../domain/entities/product.entity';
import { Result } from '../utils/result';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts() {
    const result: Result<Product[]> =
      await this.productService.getAllProducts();
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getProduct(@Param('id') productId: string) {
    const result: Result<Product> =
      await this.productService.getProduct(productId);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(result.error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') productId: string,
    @Body('stock') stock: number,
  ) {
    const result: Result<Product> = await this.productService.updateProduct(
      productId,
      stock,
    );
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        result.error.message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
