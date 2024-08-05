import { Test, TestingModule } from '@nestjs/testing';
import { CustomerController } from '../../controllers/customer.controller';
import { CustomerService } from '../../application/services/customer.service';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../utils/result';
import { HttpException } from '@nestjs/common';

describe('CustomerController', () => {
  let controller: CustomerController;
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: {
            createCustomerDB: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomerController>(CustomerController);
    service = module.get<CustomerService>(CustomerService);
  });

  describe('createCustomer', () => {
    it('should return customer if creation is successful', async () => {
      const customer = new Customer();
      const result = Result.ok(customer);
      jest
        .spyOn(service, 'createCustomerDB')
        .mockResolvedValue(Promise.resolve(result));

      expect(await controller.createCustomer(customer)).toBe(customer);
    });

    it('should throw HttpException if creation fails', async () => {
      const customer = new Customer();
      const error = new Error('Creation failed');
      const result = Result.fail<Customer>(error);
      jest.spyOn(service, 'createCustomerDB').mockResolvedValue(result);

      await expect(controller.createCustomer(customer)).rejects.toThrow(
        new HttpException(error.message, 422),
      );
    });
  });
});
