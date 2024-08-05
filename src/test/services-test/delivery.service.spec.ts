import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryService } from '../../application/services/delivery.service';
import { DeliveryDbAdapter } from '../../adapters/delivery-db.adapter';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Result } from '../../utils/result';

describe('DeliveryService', () => {
  let deliveryService: DeliveryService;
  let deliveryDbAdapter: DeliveryDbAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: DeliveryDbAdapter,
          useValue: {
            createDeliveryDB: jest.fn(),
          },
        },
      ],
    }).compile();

    deliveryService = module.get<DeliveryService>(DeliveryService);
    deliveryDbAdapter = module.get<DeliveryDbAdapter>(DeliveryDbAdapter);
  });

  it('should be defined', () => {
    expect(deliveryService).toBeDefined();
  });

  describe('createDeliveryDB', () => {
    it('should return success result when delivery is created successfully', async () => {
      const mockDelivery: Delivery = {
        deliveryId: '1',
        shippingData: '{}',
        status: '',
      };
      const mockResult = Result.ok(mockDelivery);

      jest
        .spyOn(deliveryDbAdapter, 'createDeliveryDB')
        .mockResolvedValue(mockResult);

      const result = await deliveryService.createDeliveryDB(mockDelivery);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockDelivery);
      expect(deliveryDbAdapter.createDeliveryDB).toHaveBeenCalledWith(
        mockDelivery,
      );
    });

    it('should return fail result when delivery creation fails', async () => {
      const mockDelivery: Delivery = {
        deliveryId: '1',
        shippingData: '{}',
        status: '',
      };
      const mockError = new Error('Failed to create delivery');
      const mockResult = Result.fail<Delivery>(mockError);

      jest
        .spyOn(deliveryDbAdapter, 'createDeliveryDB')
        .mockResolvedValue(mockResult);

      const result = await deliveryService.createDeliveryDB(mockDelivery);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(mockError);
      expect(deliveryDbAdapter.createDeliveryDB).toHaveBeenCalledWith(
        mockDelivery,
      );
    });
  });
});
