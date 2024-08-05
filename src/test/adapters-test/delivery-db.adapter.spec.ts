import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryDbAdapter } from '../../adapters/delivery-db.adapter';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Delivery } from '../../domain/entities/delivery.entity';

const mockDynamoDBClient = {
  send: jest.fn(),
};

describe('DeliveryDbAdapter', () => {
  let deliveryDbAdapter: DeliveryDbAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryDbAdapter,
        { provide: 'DYNAMO_DB', useValue: mockDynamoDBClient },
      ],
    }).compile();

    deliveryDbAdapter = module.get<DeliveryDbAdapter>(DeliveryDbAdapter);
  });

  it('should be defined', () => {
    expect(deliveryDbAdapter).toBeDefined();
  });

  describe('createDeliveryDB', () => {
    it('should return a Result with the delivery if successful', async () => {
      const delivery: Delivery = {
        deliveryId: '123',
        shippingData: 'Some data',
        status: 'PENDING',
      };

      mockDynamoDBClient.send.mockResolvedValueOnce({});

      const result = await deliveryDbAdapter.createDeliveryDB(delivery);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(delivery);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
    });

    it('should return a Result with an error if the operation fails', async () => {
      const delivery: Delivery = {
        deliveryId: '123',
        shippingData: 'Some data',
        status: 'PENDING',
      };

      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await deliveryDbAdapter.createDeliveryDB(delivery);

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('Failed to create delivery in DB');
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
    });
  });
});
