import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../application/services/transaction.service';
import { TransactionDbAdapter } from '../../adapters/transaction-db.adapter';
import { PayService } from '../../application/services/api-client.service';
import { CustomerService } from '../../application/services/customer.service';
import { DeliveryService } from '../../application/services/delivery.service';
import { AxiosResponse } from 'axios';
import { Result } from '../../utils/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Customer } from '../../domain/entities/customer.entity';
import { Delivery } from '../../domain/entities/delivery.entity';

jest.mock('../../adapters/transaction-db.adapter');
jest.mock('../../application/services/api-client.service');
jest.mock('../../application/services/customer.service');
jest.mock('../../application/services/delivery.service');

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionDbAdapter: TransactionDbAdapter;
  let payService: PayService;
  let customerService: CustomerService;
  let deliveryService: DeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TransactionDbAdapter,
          useValue: {
            createTransactionDB: jest.fn(),
            updateTransactionDB: jest.fn(),
          },
        },
        {
          provide: PayService,
          useValue: {
            createTransaction: jest.fn(),
          },
        },
        {
          provide: CustomerService,
          useValue: {
            createCustomerDB: jest.fn(),
          },
        },
        {
          provide: DeliveryService,
          useValue: {
            createDeliveryDB: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionDbAdapter =
      module.get<TransactionDbAdapter>(TransactionDbAdapter);
    payService = module.get<PayService>(PayService);
    customerService = module.get<CustomerService>(CustomerService);
    deliveryService = module.get<DeliveryService>(DeliveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransactionDB', () => {
    it('should create a transaction in the DB and return Result', async () => {
      const transaction: Transaction = {
        transactionId: '123',
        reference: 'ref-123',
        amountInCents: 1000,
        currency: 'USD',
        customerId: 'cust-123',
        customerEmail: 'test@example.com',
        paymentMethod: 'CARD',
        status: 'PENDING',
      };
      jest
        .spyOn(transactionDbAdapter, 'createTransactionDB')
        .mockResolvedValue(Result.ok(transaction));

      const result = await service.createTransactionDB(transaction);

      expect(transactionDbAdapter.createTransactionDB).toHaveBeenCalledWith(
        transaction,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(transaction);
    });

    it('should return fail Result when there is an error', async () => {
      const transaction: Transaction = {
        transactionId: '123',
        reference: 'ref-123',
        amountInCents: 1000,
        currency: 'USD',
        customerId: 'cust-123',
        customerEmail: 'test@example.com',
        paymentMethod: 'CARD',
        status: 'PENDING',
      };
      const error = new Error('Error creating transaction');
      jest
        .spyOn(transactionDbAdapter, 'createTransactionDB')
        .mockRejectedValue(error);

      const result = await service.createTransactionDB(transaction);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('getTransactionDB', () => {
    it('should return a transaction if found', async () => {
      const transactionId = '123';
      const transaction: Transaction = {
        transactionId: '123',
        reference: 'ref-123',
        amountInCents: 1000,
        currency: 'USD',
        customerId: 'cust-123',
        customerEmail: 'test@example.com',
        paymentMethod: 'CARD',
        status: 'PENDING',
      };
      jest
        .spyOn(transactionDbAdapter, 'getTransactionDB')
        .mockResolvedValue(Result.ok(transaction));

      const result = await service.getTransactionDB(transactionId);

      expect(transactionDbAdapter.getTransactionDB).toHaveBeenCalledWith(
        transactionId,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(transaction);
    });

    it('should return fail Result when transaction is not found', async () => {
      const transactionId = '123';
      jest
        .spyOn(transactionDbAdapter, 'getTransactionDB')
        .mockResolvedValue(null);

      const result = await service.getTransactionDB(transactionId);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(new Error('Transaction not found'));
    });

    it('should return fail Result when there is an error', async () => {
      const transactionId = '123';
      const error = new Error('Error getting transaction');
      jest
        .spyOn(transactionDbAdapter, 'getTransactionDB')
        .mockRejectedValue(error);

      const result = await service.getTransactionDB(transactionId);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('updateTransactionDB', () => {
    it('should update a transaction in the DB and return Result', async () => {
      const transactionId = '123';
      const status = 'APPROVED';
      const transaction: Transaction = {
        transactionId: '123',
        reference: 'ref-123',
        amountInCents: 1000,
        currency: 'USD',
        customerId: 'cust-123',
        customerEmail: 'test@example.com',
        paymentMethod: 'CARD',
        status: 'APPROVED',
      };
      jest
        .spyOn(transactionDbAdapter, 'updateTransactionDB')
        .mockResolvedValue(Result.ok(transaction));

      const result = await service.updateTransactionDB(transactionId, status);

      expect(transactionDbAdapter.updateTransactionDB).toHaveBeenCalledWith(
        transactionId,
        status,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(transaction);
    });

    it('should return fail Result when update fails', async () => {
      const transactionId = '123';
      const status = 'APPROVED';
      const error = new Error('Failed to update transaction');
      jest
        .spyOn(transactionDbAdapter, 'updateTransactionDB')
        .mockRejectedValue(error);

      const result = await service.updateTransactionDB(transactionId, status);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token from payService', async () => {
      const token = 'token';
      const axiosResponse: AxiosResponse = {
        data: token,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };
      jest
        .spyOn(payService, 'getTokenMerchant')
        .mockResolvedValue(axiosResponse);

      const result = await service.getAcceptanceToken();

      expect(payService.getTokenMerchant).toHaveBeenCalled();
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(token);
    });

    it('should return fail Result when there is an error', async () => {
      const error = new Error('Error getting token');
      jest.spyOn(payService, 'getTokenMerchant').mockRejectedValue(error);

      const result = await service.getAcceptanceToken();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('getTokenCard', () => {
    it('should return a token when payService.getTokenCard is successful', async () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expMonth: 12,
        expYear: 2025,
        cvv: '123',
      };
      const token = 'token';
      jest.spyOn(payService, 'getTokenCard').mockResolvedValue({
        data: token,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      });

      const result = await service.getTokenCard(cardData);

      expect(payService.getTokenCard).toHaveBeenCalledWith(cardData);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(token);
    });

    it('should return fail Result when payService.getTokenCard fails', async () => {
      const cardData = {
        cardNumber: '1234567890123456',
        expMonth: 12,
        expYear: 2025,
        cvv: '123',
      };
      const error = new Error('Failed to get token');

      jest.spyOn(payService, 'getTokenCard').mockRejectedValue(error);

      const result = await service.getTokenCard(cardData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('getPaymentSource', () => {
    it('should return a successful result with payment source data', async () => {
      const paymentSourceData = { some: 'data' };
      const responseData = { id: 'ps-123', status: 'active' };

      jest.spyOn(payService, 'getPaymentSource').mockResolvedValue({
        data: responseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      });

      const result = await service.getPaymentSource(paymentSourceData);

      expect(payService.getPaymentSource).toHaveBeenCalledWith(
        paymentSourceData,
      );
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(responseData);
    });

    it('should return a failed result when there is an error', async () => {
      const paymentSourceData = { some: 'data' };
      const error = new Error('Error retrieving payment source');

      jest.spyOn(payService, 'getPaymentSource').mockRejectedValue(error);

      const result = await service.getPaymentSource(paymentSourceData);

      expect(payService.getPaymentSource).toHaveBeenCalledWith(
        paymentSourceData,
      );
      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('getStatus', () => {
    it('should return a successful result with transaction status', async () => {
      const transactionId = '123';
      const status = 'approved';

      jest.spyOn(payService, 'getStatus').mockResolvedValue({
        data: { status },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      });

      const result = await service.getStatus(transactionId);

      expect(payService.getStatus).toHaveBeenCalledWith(transactionId);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(status);
    });

    it('should return a failed result if response data is missing', async () => {
      const transactionId = '123';

      jest.spyOn(payService, 'getStatus').mockResolvedValue({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined },
      });

      const result = await service.getStatus(transactionId);

      expect(payService.getStatus).toHaveBeenCalledWith(transactionId);
      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(new Error('Response data is missing'));
    });

    it('should return a failed result when there is an error', async () => {
      const transactionId = '123';
      const error = new Error('Error retrieving status');

      jest.spyOn(payService, 'getStatus').mockRejectedValue(error);

      const result = await service.getStatus(transactionId);

      expect(payService.getStatus).toHaveBeenCalledWith(transactionId);
      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(error);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const transactionData = {
        amount_in_cents: 1000,
        currency: 'USD',
        expiration_time: Date.now() + 3600 * 1000, // 1 hour later
        customer_data: { legal_id: '12345' },
        customer_email: 'customer@example.com',
        payment_method: 'CREDIT_CARD',
        shipping_address: {},
      };

      const mockedPayResponse = { data: { id: 'transaction-id' } };
      jest.spyOn(payService, 'createTransaction').mockResolvedValue({
        data: mockedPayResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      });
      jest
        .spyOn(transactionDbAdapter, 'createTransactionDB')
        .mockResolvedValue(Result.ok(new Transaction()));
      jest
        .spyOn(transactionDbAdapter, 'updateTransactionDB')
        .mockResolvedValue(Result.ok(new Transaction()));
      jest
        .spyOn(customerService, 'createCustomerDB')
        .mockResolvedValue(Result.ok(new Customer()));
      jest
        .spyOn(deliveryService, 'createDeliveryDB')
        .mockResolvedValue(Result.ok(new Delivery()));

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('OK');
    });

    it('should fail if response data is missing', async () => {
      const transactionData = {
        /* ...data... */
      };
      jest.spyOn(payService, 'createTransaction').mockResolvedValue({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      }); // Simulate no data

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(new Error('Response data is missing'));
    });

    it('should fail to save transaction to DB', async () => {
      const transactionData = {
        /* ...data... */
      };
      const mockedPayResponse = { data: { id: 'transaction-id' } };
      jest.spyOn(payService, 'createTransaction').mockResolvedValue({
        data: mockedPayResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      });
      jest
        .spyOn(transactionDbAdapter, 'createTransactionDB')
        .mockResolvedValue(Result.fail(new Error('DB Error')));

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(
        new Error('Failed to create transaction DB entry'),
      );
    });

    it('should poll transaction status and handle completion', async () => {
      const transactionData = {
        amount_in_cents: 1000,
        currency: 'USD',
        expiration_time: Date.now() + 3600 * 1000,
        customer_data: { legal_id: '12345' },
        customer_email: 'customer@example.com',
        payment_method: 'CREDIT_CARD',
        shipping_address: {},
      };

      const mockedPayResponse = { data: { id: 'transaction-id' } };
      jest.spyOn(payService, 'createTransaction').mockResolvedValue({
        data: mockedPayResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      });
      jest
        .spyOn(transactionDbAdapter, 'createTransactionDB')
        .mockResolvedValue(Result.ok(new Transaction()));
      jest
        .spyOn(transactionDbAdapter, 'updateTransactionDB')
        .mockResolvedValue(Result.ok(new Transaction()));
      jest
        .spyOn(customerService, 'createCustomerDB')
        .mockResolvedValue(Result.ok(new Customer()));
      jest
        .spyOn(deliveryService, 'createDeliveryDB')
        .mockResolvedValue(Result.ok(new Delivery()));

      // Simulate transaction status polling
      jest
        .spyOn(service as any, 'pollTransactionStatus')
        .mockResolvedValue('COMPLETED');

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('Completed');
    });

    it('should mark transaction as error if status is PENDING', async () => {
      const transactionData = {
        amount_in_cents: 1000,
        currency: 'USD',
        expiration_time: Date.now() + 3600 * 1000,
        customer_data: { legal_id: '12345' },
        customer_email: 'customer@example.com',
        payment_method: 'CREDIT_CARD',
        shipping_address: {},
      };

      const mockedPayResponse = { data: { id: 'transaction-id' } };
      jest.spyOn(payService, 'createTransaction').mockResolvedValue({
        data: mockedPayResponse.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      });
      jest
        .spyOn(transactionDbAdapter, 'createTransactionDB')
        .mockResolvedValue(Result.ok(new Transaction()));
      jest
        .spyOn(service as any, 'pollTransactionStatus')
        .mockResolvedValue('PENDING');
      jest
        .spyOn(transactionDbAdapter, 'updateTransactionDB')
        .mockResolvedValue(Result.ok(new Transaction()));

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('ERROR');
    });

    it('should return fail when error occurs', async () => {
      const transactionData = {
        /* ...data... */
      };
      jest.spyOn(payService, 'createTransaction').mockImplementation(() => {
        throw new Error('Some error');
      });

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(new Error('Some error'));
    });
  });
});
