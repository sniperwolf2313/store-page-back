// test/adapters-test/product-db.adapter.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ProductDbAdapter } from '../../adapters/product-db.adapter';
import { ScanCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Product } from '../../domain/entities/product.entity';

const mockDynamoDBClient = {
  send: jest.fn(),
};

describe('ProductDbAdapter', () => {
  let productDbAdapter: ProductDbAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductDbAdapter,
        { provide: 'DYNAMO_DB', useValue: mockDynamoDBClient },
      ],
    }).compile();

    productDbAdapter = module.get<ProductDbAdapter>(ProductDbAdapter);
  });

  it('should be defined', () => {
    expect(productDbAdapter).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should return a Result with an array of products if successful', async () => {
      const mockProducts: Product[] = [
        {
          productId: '1',
          stock: 10,
          productName: '',
          price: 0,
          description: '',
          imageURL: '',
        },
      ];

      mockDynamoDBClient.send.mockResolvedValueOnce({ Items: mockProducts });

      const result = await productDbAdapter.getAllProducts();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockProducts);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(ScanCommand),
      );
    });

    it('should return a Result with an error if the operation fails', async () => {
      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await productDbAdapter.getAllProducts();

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('DynamoDB error');
    });
  });

  describe('getProduct', () => {
    it('should return a Result with a product if successful', async () => {
      const mockProduct: Product = {
        productId: '1',
        stock: 10,
        productName: '',
        price: 0,
        description: '',
        imageURL: '',
      };

      mockDynamoDBClient.send.mockResolvedValueOnce({ Item: mockProduct });

      const result = await productDbAdapter.getProduct('1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockProduct);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );
    });

    it('should return a Result with an error if the operation fails', async () => {
      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await productDbAdapter.getProduct('1');

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('DynamoDB error');
    });
  });

  describe('updateProduct', () => {
    it('should return a Result with the updated product if successful', async () => {
      const mockUpdatedProduct: Product = {
        productId: '1',
        stock: 20,
        productName: '',
        price: 0,
        description: '',
        imageURL: '',
      };

      mockDynamoDBClient.send.mockResolvedValueOnce({
        Attributes: mockUpdatedProduct,
      });

      const result = await productDbAdapter.updateProduct('1', 20);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockUpdatedProduct);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(UpdateCommand),
      );
    });

    it('should return a Result with an error if the operation fails', async () => {
      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await productDbAdapter.updateProduct('1', 20);

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('DynamoDB error');
    });
  });
});
