import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../application/services/transaction.service';
import { TransactionDbAdapter } from '../../adapters/transaction-db.adapter';
import { PayService } from '../../application/services/api-client.service';
import { CustomerService } from '../../application/services/customer.service';
import { DeliveryService } from '../../application/services/delivery.service';
import { DynamoDBModule } from '../../modules/dynamodb.module';
import { HttpModule } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Result } from '../../utils/result';
import { Transaction } from '../../domain/entities/transaction.entity';

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
      imports: [DynamoDBModule, HttpModule],
      providers: [
        TransactionService,
        TransactionDbAdapter,
        PayService,
        CustomerService,
        DeliveryService,
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
    it('should create a transaction and return the status', async () => {
      const transactionData = {
        amount_in_cents: 1000,
        expiration_time: '2024-12-31',
        currency: 'USD',
      };
      const responseData = {
        id: 'txn-123',
        reference: 'ref-123',
        amount_in_cents: 1000,
        currency: 'USD',
        customer_data: {
          legal_id: 'cust-123',
          legal_id_type: 'ID',
          full_name: 'John Doe',
          phone_number: '1234567890',
        },
        customer_email: 'test@example.com',
        payment_method: 'CARD',
        status: 'PENDING',
        shipping_address: '123 Shipping St',
      };
      const transactionResult = {
        transactionId: 'txn-123',
        reference: 'ref-123',
        amountInCents: 1000,
        currency: 'USD',
        customerId: 'cust-123',
        customerEmail: 'test@example.com',
        paymentMethod: 'CARD',
        status: 'PENDING',
      };

      jest
        .spyOn(service, 'createTransactionDB')
        .mockResolvedValue(Result.ok(transactionResult));
      jest.spyOn(service, 'getStatus').mockResolvedValue(Result.ok('PENDING'));
      jest
        .spyOn(service, 'updateTransactionDB')
        .mockResolvedValue(Result.ok(transactionResult));
      jest.spyOn(customerService, 'createCustomerDB').mockResolvedValue(
        Result.ok({
          customerId: 'cust-123',
          idType: 'ID',
          name: 'John Doe',
          email: 'test@example.com',
          phone_number: '1234567890',
          deliveryAddress: '123 Shipping St',
        }),
      );
      jest.spyOn(deliveryService, 'createDeliveryDB').mockResolvedValue(
        Result.ok({
          deliveryId: 'txn-123',
          shippingData: '123 Shipping St',
          status: 'PENDING',
        }),
      );

      const result = await service.createTransaction(transactionData);

      expect(service.createTransactionDB).toHaveBeenCalledWith({
        transactionId: responseData.id,
        reference: responseData.reference,
        amountInCents: responseData.amount_in_cents,
        currency: responseData.currency,
        customerId: responseData.customer_data.legal_id,
        customerEmail: responseData.customer_email,
        paymentMethod: responseData.payment_method,
        status: responseData.status,
      });
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual('PENDING');
    });

    it('should return an error if transaction DB creation fails', async () => {
      const transactionData = {
        amount_in_cents: 1000,
        expiration_time: '2024-12-31',
        currency: 'USD',
      };

      jest
        .spyOn(service, 'createTransactionDB')
        .mockResolvedValue(
          Result.fail(new Error('Failed to create transaction DB entry')),
        );
      jest.spyOn(service, 'getStatus').mockResolvedValue(Result.ok('PENDING'));
      jest.spyOn(customerService, 'createCustomerDB').mockResolvedValue(
        Result.ok({
          customerId: 'cust-123',
          idType: 'ID',
          name: 'John Doe',
          email: 'test@example.com',
          phone_number: '1234567890',
          deliveryAddress: '123 Shipping St',
        }),
      );
      jest.spyOn(deliveryService, 'createDeliveryDB').mockResolvedValue(
        Result.ok({
          deliveryId: 'txn-123',
          shippingData: '123 Shipping St',
          status: 'PENDING',
        }),
      );

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(
        new Error('Failed to create transaction DB entry'),
      );
    });

    it('should return an error if status retrieval fails', async () => {
      const transactionData = {
        amount_in_cents: 1000,
        expiration_time: '2024-12-31',
        currency: 'USD',
      };

      jest.spyOn(service, 'createTransactionDB').mockResolvedValue(
        Result.ok({
          transactionId: 'txn-123',
          reference: 'ref-123',
          amountInCents: 1000,
          currency: 'USD',
          customerId: 'cust-123',
          customerEmail: 'test@example.com',
          paymentMethod: 'CARD',
          status: 'PENDING',
        }),
      );
      jest
        .spyOn(service, 'getStatus')
        .mockResolvedValue(
          Result.fail(new Error('Failed to retrieve transaction status')),
        );
      jest.spyOn(customerService, 'createCustomerDB').mockResolvedValue(
        Result.ok({
          customerId: 'cust-123',
          idType: 'ID',
          name: 'John Doe',
          email: 'test@example.com',
          phone_number: '1234567890',
          deliveryAddress: '123 Shipping St',
        }),
      );
      jest.spyOn(deliveryService, 'createDeliveryDB').mockResolvedValue(
        Result.ok({
          deliveryId: 'txn-123',
          shippingData: '123 Shipping St',
          status: 'PENDING',
        }),
      );

      const result = await service.createTransaction(transactionData);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(
        new Error('Failed to retrieve transaction status'),
      );
    });
  });
});
