import { Test, TestingModule } from '@nestjs/testing';
import { TransactionDbAdapter } from '../../adapters/transaction-db.adapter';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Transaction } from '../../domain/entities/transaction.entity';

const mockDynamoDBClient = {
  send: jest.fn(),
};

describe('TransactionDbAdapter', () => {
  let transactionDbAdapter: TransactionDbAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionDbAdapter,
        { provide: 'DYNAMO_DB', useValue: mockDynamoDBClient },
      ],
    }).compile();

    transactionDbAdapter =
      module.get<TransactionDbAdapter>(TransactionDbAdapter);
  });

  it('should be defined', () => {
    expect(transactionDbAdapter).toBeDefined();
  });

  describe('createTransactionDB', () => {
    it('should return a Result with the transaction if successful', async () => {
      const mockTransaction: Transaction = {
        transactionId: '1',
        status: 'pending',
        reference: '',
        amountInCents: 0,
        currency: '',
        customerId: undefined,
        customerEmail: '',
        paymentMethod: undefined,
      };

      mockDynamoDBClient.send.mockResolvedValueOnce({});

      const result =
        await transactionDbAdapter.createTransactionDB(mockTransaction);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockTransaction);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
    });

    it('should return a Result with an error if the operation fails', async () => {
      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await transactionDbAdapter.createTransactionDB({
        transactionId: '1',
        status: 'pending',
        reference: '',
        amountInCents: 0,
        currency: '',
        customerId: undefined,
        customerEmail: '',
        paymentMethod: undefined,
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('DynamoDB error');
    });
  });

  describe('getTransactionDB', () => {
    it('should return a Result with the transaction if found', async () => {
      const mockTransaction: Transaction = {
        transactionId: '1',
        status: 'pending',
        reference: '',
        amountInCents: 0,
        currency: '',
        customerId: undefined,
        customerEmail: '',
        paymentMethod: undefined,
      };

      mockDynamoDBClient.send.mockResolvedValueOnce({ Item: mockTransaction });

      const result = await transactionDbAdapter.getTransactionDB('1');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockTransaction);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand),
      );
    });

    it('should return a Result with an error if not found', async () => {
      mockDynamoDBClient.send.mockResolvedValueOnce({ Item: undefined });

      const result = await transactionDbAdapter.getTransactionDB('1');

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('Transaction not found');
    });

    it('should return a Result with an error if the operation fails', async () => {
      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await transactionDbAdapter.getTransactionDB('1');

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('DynamoDB error');
    });
  });

  describe('updateTransactionDB', () => {
    it('should return a Result with the updated transaction if successful', async () => {
      const mockUpdatedTransaction: Transaction = {
        transactionId: '1',
        status: 'completed',
        reference: '',
        amountInCents: 0,
        currency: '',
        customerId: undefined,
        customerEmail: '',
        paymentMethod: undefined,
      };

      mockDynamoDBClient.send.mockResolvedValueOnce({
        Attributes: mockUpdatedTransaction,
      });

      const result = await transactionDbAdapter.updateTransactionDB(
        '1',
        'completed',
      );

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockUpdatedTransaction);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(UpdateCommand),
      );
    });

    it('should return a Result with an error if the operation fails', async () => {
      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await transactionDbAdapter.updateTransactionDB(
        '1',
        'completed',
      );

      expect(result.isSuccess).toBe(false);
      expect(result.error.message).toBe('DynamoDB error');
    });
  });
});
