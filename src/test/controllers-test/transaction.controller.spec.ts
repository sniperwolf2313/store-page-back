import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../controllers/transaction.controller';
import { TransactionService } from '../../application/services/transaction.service';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Result } from '../../utils/result';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            createTransactionDB: jest.fn(),
            updateTransactionDB: jest.fn(),
            getAcceptanceToken: jest.fn(),
            getTokenCard: jest.fn(),
            getPaymentSource: jest.fn(),
            createTransaction: jest.fn(),
            getStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  describe('createTransactionDB', () => {
    it('should return transaction if creation is successful', async () => {
      const transaction = new Transaction();
      const result = Result.ok(transaction);
      jest.spyOn(service, 'createTransactionDB').mockResolvedValue(result);

      expect(await controller.createTransactionDB(transaction)).toBe(
        transaction,
      );
    });

    it('should throw HttpException if creation fails', async () => {
      const transaction = new Transaction();
      const error = new Error('Failed to create transaction');
      const result = Result.fail<Transaction>(error);
      jest.spyOn(service, 'createTransactionDB').mockResolvedValue(result);

      await expect(controller.createTransactionDB(transaction)).rejects.toThrow(
        new HttpException(
          { status: HttpStatus.UNPROCESSABLE_ENTITY, error: error.message },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('updateTransaction', () => {
    it('should return updated transaction if successful', async () => {
      const transaction = new Transaction();
      const result = Result.ok(transaction);
      jest.spyOn(service, 'updateTransactionDB').mockResolvedValue(result);

      expect(await controller.updateTransaction('1', 'completed')).toBe(
        transaction,
      );
    });

    it('should throw HttpException if update fails', async () => {
      const error = new Error('Failed to update transaction');
      const result = Result.fail<Transaction>(error);
      jest.spyOn(service, 'updateTransactionDB').mockResolvedValue(result);

      await expect(
        controller.updateTransaction('1', 'completed'),
      ).rejects.toThrow(
        new HttpException(
          { status: HttpStatus.UNPROCESSABLE_ENTITY, error: error.message },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token if successful', async () => {
      const token = 'sample-token';
      const result = Result.ok(token);
      jest.spyOn(service, 'getAcceptanceToken').mockResolvedValue(result);

      expect(await controller.getAcceptanceToken()).toBe(token);
    });

    it('should throw HttpException if retrieval fails', async () => {
      const error = new Error('Failed to retrieve acceptance token');
      const result = Result.fail<string>(error);
      jest.spyOn(service, 'getAcceptanceToken').mockResolvedValue(result);

      await expect(controller.getAcceptanceToken()).rejects.toThrow(
        new HttpException(
          { status: HttpStatus.UNPROCESSABLE_ENTITY, error: error.message },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('getTokenCard', () => {
    it('should return token if successful', async () => {
      const token = 'card-token';
      const result = Result.ok(token);
      jest.spyOn(service, 'getTokenCard').mockResolvedValue(result);

      expect(
        await controller.getTokenCard({ cardNumber: '1234567890123456' }),
      ).toBe(token);
    });

    it('should throw HttpException if retrieval fails', async () => {
      const error = new Error('Failed to get card token');
      const result = Result.fail<string>(error);
      jest.spyOn(service, 'getTokenCard').mockResolvedValue(result);

      await expect(
        controller.getTokenCard({ cardNumber: '1234567890123456' }),
      ).rejects.toThrow(
        new HttpException(
          { status: HttpStatus.UNPROCESSABLE_ENTITY, error: error.message },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('getPaymentSource', () => {
    it('should return payment source if successful', async () => {
      const paymentSource = { source: 'payment-source' };
      const result = Result.ok(paymentSource);
      jest.spyOn(service, 'getPaymentSource').mockResolvedValue(result);

      expect(await controller.getPaymentSource({ paymentData: 'data' })).toBe(
        paymentSource,
      );
    });

    it('should throw HttpException if retrieval fails', async () => {
      const error = new Error('Failed to get payment source');
      const result = Result.fail<any>(error);
      jest.spyOn(service, 'getPaymentSource').mockResolvedValue(result);

      await expect(
        controller.getPaymentSource({ paymentData: 'data' }),
      ).rejects.toThrow(
        new HttpException(
          { status: HttpStatus.UNPROCESSABLE_ENTITY, error: error.message },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('createTransaction', () => {
    it('should return transaction ID if creation is successful', async () => {
      const transactionId = 'transaction-id';
      const result = Result.ok(transactionId);
      jest.spyOn(service, 'createTransaction').mockResolvedValue(result);

      expect(
        await controller.createTransaction({ data: 'transaction-data' }),
      ).toBe(transactionId);
    });

    it('should throw HttpException if creation fails', async () => {
      const error = new Error('Failed to create transaction');
      const result = Result.fail<string>(error);
      jest.spyOn(service, 'createTransaction').mockResolvedValue(result);

      await expect(
        controller.createTransaction({ data: 'transaction-data' }),
      ).rejects.toThrow(
        new HttpException(
          { status: HttpStatus.UNPROCESSABLE_ENTITY, error: error.message },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });

  describe('getStatus', () => {
    it('should return transaction status if successful', async () => {
      const status = 'APPROVED';
      const result = Result.ok(status);
      jest.spyOn(service, 'getStatus').mockResolvedValue(result);

      expect(await controller.getStatus('transaction-id')).toBe(status);
    });

    it('should throw HttpException if retrieval fails', async () => {
      const error = new Error('Failed to get transaction status');
      const result = Result.fail<any>(error);
      jest.spyOn(service, 'getStatus').mockResolvedValue(result);

      await expect(controller.getStatus('transaction-id')).rejects.toThrow(
        new HttpException(
          {
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            error: error.message,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });
  });
});
