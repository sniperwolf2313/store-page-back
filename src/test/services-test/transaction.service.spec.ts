import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../application/services/transaction.service';
import { TransactionDbAdapter } from '../../adapters/transaction-db.adapter';
import { PayService } from '../../application/services/api-client.service';
import { CustomerService } from '../../application/services/customer.service';
import { DeliveryService } from '../../application/services/delivery.service';
import { DynamoDBModule } from '../../modules/dynamodb.module';
import { HttpModule } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Result } from 'src/utils/result';
import { Transaction } from '../../domain/entities/transaction.entity';

jest.mock('../../adapters/transaction-db.adapter');
jest.mock('../../application/services/api-client.service');
jest.mock('../../application/services/customer.service');
jest.mock('../../application/services/delivery.service');

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionDbAdapter: TransactionDbAdapter;
  let payService: PayService;

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
    transactionDbAdapter = module.get<TransactionDbAdapter>(TransactionDbAdapter);
    payService = module.get<PayService>(PayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionDbAdapter: TransactionDbAdapter;
  let payService: PayService;

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
});
