import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ProductService } from '../application/services/product.service';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  @Get(':id')
  async getProduct(@Param('id') productId: string) {
    return await this.productService.getProduct(productId);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') productId: string,
    @Body('stock') stock: number,
  ) {
    return await this.productService.updateProduct(productId, stock);
  }
}
