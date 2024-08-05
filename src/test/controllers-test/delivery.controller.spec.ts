import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from '../../controllers/delivery.controller';
import { DeliveryService } from '../../application/services/delivery.service';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Result } from '../../utils/result';
import { HttpException } from '@nestjs/common';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let service: DeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DeliveryService,
          useValue: {
            createDeliveryDB: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
    service = module.get<DeliveryService>(DeliveryService);
  });

  describe('createDeliveryDB', () => {
    it('should return delivery if creation is successful', async () => {
      const delivery = new Delivery();
      const result = Result.ok(delivery);
      jest.spyOn(service, 'createDeliveryDB').mockResolvedValue(result);

      expect(await controller.createDeliveryDB(delivery)).toBe(delivery);
    });

    it('should throw HttpException if creation fails', async () => {
      const delivery = new Delivery();
      const error = new Error('Creation failed');
      const result = Result.fail<Delivery>(error);
      jest.spyOn(service, 'createDeliveryDB').mockResolvedValue(result);

      await expect(controller.createDeliveryDB(delivery)).rejects.toThrow(
        new HttpException(error.message, 422),
      );
    });
  });
});
