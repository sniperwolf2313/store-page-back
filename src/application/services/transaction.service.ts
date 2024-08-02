import { Injectable } from '@nestjs/common';
import { TransactionDbAdapter } from '../../adapters/transaction-db.adapter';
import { Transaction } from 'src/domain/entities/transaction.entity';
import { PayService } from './api-client.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionDbAdapter: TransactionDbAdapter,
    private readonly payService: PayService,
  ) {}
  async createTransactionDB(transaction: Transaction): Promise<Transaction> {
    return this.transactionDbAdapter.createTransactionDB(transaction);
  }
  async getTransactionDB(transactionId: string): Promise<Transaction> {
    return this.transactionDbAdapter.getTransactionDB(transactionId);
  }
  async updateTransactionDB(
    transactionId: string,
    status: string,
  ): Promise<Transaction> {
    return this.transactionDbAdapter.updateTransactionDB(transactionId, status);
  }
  async getAcceptanceToken() {
    return this.payService.getTokenMerchant();
  }

  async getTokenCard(cardData: any) {
    return this.payService.getTokenCard(cardData);
  }
  async getPaymentSource(paymentSourceData: any) {
    return this.payService.getPaymentSource(paymentSourceData);
  }
  async createTransaction(transactionData: any) {
    return this.payService.createTransaction(transactionData);
  }
  async getStatus(transactionId: string) {
    return this.payService.getStatus(transactionId);
  }
}
