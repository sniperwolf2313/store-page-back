import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from '../../application/services/customer.service';
import { CustomerDbAdapter } from '../../adapters/customer-db.adapter';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../utils/result';

describe('CustomerService', () => {
  let customerService: CustomerService;
  let customerDbAdapter: CustomerDbAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerDbAdapter,
          useValue: {
            createCustomerDB: jest.fn(),
          },
        },
      ],
    }).compile();

    customerService = module.get<CustomerService>(CustomerService);
    customerDbAdapter = module.get<CustomerDbAdapter>(CustomerDbAdapter);
  });

  it('should be defined', () => {
    expect(customerService).toBeDefined();
  });

  describe('createCustomerDB', () => {
    it('should return success result when customer is created successfully', async () => {
      const mockCustomer: Customer = {
        customerId: '1',
        name: 'John Doe',
        idType: '',
        email: '',
        phone_number: '',
        deliveryAddress: '',
      };
      const mockResult = Result.ok(mockCustomer);

      jest
        .spyOn(customerDbAdapter, 'createCustomerDB')
        .mockResolvedValue(mockResult);

      const result = await customerService.createCustomerDB(mockCustomer);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockCustomer);
      expect(customerDbAdapter.createCustomerDB).toHaveBeenCalledWith(
        mockCustomer,
      );
    });

    it('should return fail result when customer creation fails', async () => {
      const mockCustomer: Customer = {
        customerId: '1',
        name: 'John Doe',
        idType: '',
        email: '',
        phone_number: '',
        deliveryAddress: '',
      };
      const mockError = new Error('Failed to create customer');
      const mockResult = Result.fail<Customer>(mockError);

      jest
        .spyOn(customerDbAdapter, 'createCustomerDB')
        .mockResolvedValue(mockResult);

      const result = await customerService.createCustomerDB(mockCustomer);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(mockError);
      expect(customerDbAdapter.createCustomerDB).toHaveBeenCalledWith(
        mockCustomer,
      );
    });
  });
});
