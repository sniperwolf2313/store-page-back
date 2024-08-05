import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../../application/services/product.service';
import { ProductDbAdapter } from '../../adapters/product-db.adapter';
import { Product } from '../../domain/entities/product.entity';
import { Result } from '../../utils/result';

describe('ProductService', () => {
  let productService: ProductService;
  let productDbAdapter: ProductDbAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductDbAdapter,
          useValue: {
            getAllProducts: jest.fn(),
            getProduct: jest.fn(),
            updateProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productDbAdapter = module.get<ProductDbAdapter>(ProductDbAdapter);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should return success result when products are retrieved successfully', async () => {
      const mockProducts: Product[] = [
        {
          productId: '1',
          productName: 'Product 1',
          price: 100,
          description: 'Description 1',
          stock: 10,
          imageURL: 'url1',
        },
      ];
      const mockResult = Result.ok(mockProducts);

      jest
        .spyOn(productDbAdapter, 'getAllProducts')
        .mockResolvedValue(mockResult);

      const result = await productService.getAllProducts();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockProducts);
      expect(productDbAdapter.getAllProducts).toHaveBeenCalled();
    });

    it('should return fail result when product retrieval fails', async () => {
      const mockError = new Error('Failed to retrieve products');
      const mockResult = Result.fail<Product[]>(mockError);

      jest
        .spyOn(productDbAdapter, 'getAllProducts')
        .mockResolvedValue(mockResult);

      const result = await productService.getAllProducts();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(mockError);
      expect(productDbAdapter.getAllProducts).toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('should return success result when product is retrieved successfully', async () => {
      const mockProduct: Product = {
        productId: '1',
        productName: 'Product 1',
        price: 100,
        description: 'Description 1',
        stock: 10,
        imageURL: 'url1',
      };
      const mockResult = Result.ok(mockProduct);

      jest.spyOn(productDbAdapter, 'getProduct').mockResolvedValue(mockResult);

      const result = await productService.getProduct('1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockProduct);
      expect(productDbAdapter.getProduct).toHaveBeenCalledWith('1');
    });

    it('should return fail result when product retrieval fails', async () => {
      const mockError = new Error('Product not found');
      const mockResult = Result.fail<Product>(mockError);

      jest.spyOn(productDbAdapter, 'getProduct').mockResolvedValue(mockResult);

      const result = await productService.getProduct('1');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(mockError);
      expect(productDbAdapter.getProduct).toHaveBeenCalledWith('1');
    });
  });

  describe('updateProduct', () => {
    it('should return success result when product is updated successfully', async () => {
      const mockProduct: Product = {
        productId: '1',
        productName: 'Product 1',
        price: 100,
        description: 'Description 1',
        stock: 20,
        imageURL: 'url1',
      };
      const mockResult = Result.ok(mockProduct);

      jest
        .spyOn(productDbAdapter, 'updateProduct')
        .mockResolvedValue(mockResult);

      const result = await productService.updateProduct('1', 20);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockProduct);
      expect(productDbAdapter.updateProduct).toHaveBeenCalledWith('1', 20);
    });

    it('should return fail result when product update fails', async () => {
      const mockError = new Error('Failed to update product');
      const mockResult = Result.fail<Product>(mockError);

      jest
        .spyOn(productDbAdapter, 'updateProduct')
        .mockResolvedValue(mockResult);

      const result = await productService.updateProduct('1', 20);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(mockError);
      expect(productDbAdapter.updateProduct).toHaveBeenCalledWith('1', 20);
    });
  });
});
