import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../../controllers/product.controller';
import { ProductService } from '../../application/services/product.service';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../../utils/result';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getAllProducts: jest.fn(),
            getProduct: jest.fn(),
            updateProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  describe('getAllProducts', () => {
    it('should return an array of products if successful', async () => {
      const products = [new Product(), new Product()];
      const result = Result.ok(products);
      jest.spyOn(service, 'getAllProducts').mockResolvedValue(result);

      expect(await controller.getAllProducts()).toBe(products);
    });

    it('should throw HttpException if retrieval fails', async () => {
      const error = new Error('Failed to retrieve products');
      const result = Result.fail<Product[]>(error);
      jest.spyOn(service, 'getAllProducts').mockResolvedValue(result);

      await expect(controller.getAllProducts()).rejects.toThrow(
        new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('getProduct', () => {
    it('should return a product if found', async () => {
      const product = new Product();
      const result = Result.ok(product);
      jest.spyOn(service, 'getProduct').mockResolvedValue(result);

      expect(await controller.getProduct('1')).toBe(product);
    });

    it('should throw HttpException if product not found', async () => {
      const error = new Error('Product not found');
      const result = Result.fail<Product>(error);
      jest.spyOn(service, 'getProduct').mockResolvedValue(result);

      await expect(controller.getProduct('1')).rejects.toThrow(
        new HttpException(error.message, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('updateProduct', () => {
    it('should return the updated product if successful', async () => {
      const product = new Product();
      const result = Result.ok(product);
      jest.spyOn(service, 'updateProduct').mockResolvedValue(result);

      expect(await controller.updateProduct('1', 10)).toBe(product);
    });

    it('should throw HttpException if update fails', async () => {
      const error = new Error('Failed to update product');
      const result = Result.fail<Product>(error);
      jest.spyOn(service, 'updateProduct').mockResolvedValue(result);

      await expect(controller.updateProduct('1', 10)).rejects.toThrow(
        new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY),
      );
    });
  });
});
