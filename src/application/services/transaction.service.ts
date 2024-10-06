import { Injectable } from '@nestjs/common';
import { TransactionDbAdapter } from '../../adapters/transaction-db.adapter';
import { Transaction } from '../../domain/entities/transaction.entity';
import { PayService } from './api-client.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { CustomerService } from './customer.service';
import { DeliveryService } from './delivery.service';
import { Result } from '../../utils/result';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionDbAdapter: TransactionDbAdapter,
    private readonly payService: PayService,
    private readonly customerService: CustomerService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async createTransactionDB(
    transaction: Transaction,
  ): Promise<Result<Transaction>> {
    try {
      const result =
        await this.transactionDbAdapter.createTransactionDB(transaction);
      return result;
    } catch (error) {
      return Result.fail<Transaction>(error as Error);
    }
  }

  async getTransactionDB(transactionId: string): Promise<Result<Transaction>> {
    try {
      const result =
        await this.transactionDbAdapter.getTransactionDB(transactionId);
      if (result) {
        return result;
      } else {
        return Result.fail<Transaction>(new Error('Transaction not found'));
      }
    } catch (error) {
      return Result.fail<Transaction>(error as Error);
    }
  }
  async updateTransactionDB(
    transactionId: string,
    status: string,
  ): Promise<Result<Transaction>> {
    try {
      const result = await this.transactionDbAdapter.updateTransactionDB(
        transactionId,
        status,
      );
      if (result.isSuccess) {
        return Result.ok(result.value);
      } else {
        return Result.fail<Transaction>(
          new Error('Failed to update transaction'),
        );
      }
    } catch (error) {
      return Result.fail<Transaction>(error as Error);
    }
  }

  async getAcceptanceToken(): Promise<Result<string>> {
    try {
      const response = await this.payService.getTokenMerchant();
      return Result.ok(response.data);
    } catch (error) {
      return Result.fail<string>(error as Error);
    }
  }

  async getTokenCard(cardData: any): Promise<Result<string>> {
    try {
      const response = await this.payService.getTokenCard(cardData);
      return Result.ok(response.data);
    } catch (error) {
      return Result.fail<string>(error as Error);
    }
  }

  async getPaymentSource(paymentSourceData: any): Promise<Result<any>> {
    try {
      const response =
        await this.payService.getPaymentSource(paymentSourceData);
      return Result.ok(response.data);
    } catch (error) {
      return Result.fail<any>(error as Error);
    }
  }
  async createTransaction(transactionData: any): Promise<Result<string>> {
    try {
      transactionData.reference = uuidv4();
      transactionData.signature = this.generateSignature(
        transactionData.reference,
        transactionData.amount_in_cents.toString(),
        transactionData.currency,
        transactionData.expiration_time,
      );

      const response = await this.payService.createTransaction(transactionData);
      if (!response.data) {
        return Result.fail<string>(new Error('Response data is missing'));
      }

      const transactionResult = await this.saveTransactionToDB(response.data);
      if (!transactionResult.isSuccess) {
        return Result.fail<string>(
          new Error('Failed to create transaction DB entry'),
        );
      }

      const transactionStatus = await this.pollTransactionStatus(
        response.data.id,
      );
      return transactionStatus !== 'PENDING'
        ? this.handleTransactionCompletion(response.data, transactionStatus)
        : this.markTransactionAsError(response.data.id);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return Result.fail<string>(error as Error);
    }
  }

  private async saveTransactionToDB(
    transactionData: any,
  ): Promise<Result<Transaction>> {
    return this.createTransactionDB({
      transactionId: transactionData.id,
      reference: transactionData.reference,
      amountInCents: transactionData.amount_in_cents,
      currency: transactionData.currency,
      customerId: transactionData.customer_data.legal_id,
      customerEmail: transactionData.customer_email,
      paymentMethod: transactionData.payment_method,
      status: transactionData.status,
    });
  }

  private async pollTransactionStatus(transactionId: string): Promise<string> {
    let responseStatusResult = await this.getStatus(transactionId);
    let responseStatus = responseStatusResult.isSuccess
      ? responseStatusResult.value
      : 'PENDING';
    let tries = 0;

    while (responseStatus === 'PENDING' && tries < 10) {
      tries++;
      responseStatusResult = await this.getStatus(transactionId);
      responseStatus = responseStatusResult.isSuccess
        ? responseStatusResult.value
        : 'PENDING';
    }
    return responseStatus;
  }

  private async handleTransactionCompletion(
    transactionData: any,
    status: string,
  ): Promise<Result<string>> {
    const updateResult = await this.updateTransactionDB(
      transactionData.id,
      status,
    );
    if (!updateResult.isSuccess) {
      return Result.fail<string>(
        new Error('Failed to update transaction status'),
      );
    }

    const customerResult = await this.customerService.createCustomerDB({
      customerId: transactionData.customer_data.legal_id,
      idType: transactionData.customer_data.legal_id_type,
      name: transactionData.customer_data.full_name,
      email: transactionData.customer_email,
      phone_number: transactionData.customer_data.phone_number,
      deliveryAddress: transactionData.shipping_address,
    });
    if (!customerResult.isSuccess) {
      return Result.fail<string>(
        new Error('Failed to create customer DB entry'),
      );
    }

    const deliveryResult = await this.deliveryService.createDeliveryDB({
      deliveryId: transactionData.id,
      shippingData: transactionData.shipping_address,
      status: status,
    });
    if (!deliveryResult.isSuccess) {
      return Result.fail<string>(
        new Error('Failed to create delivery DB entry'),
      );
    }

    return Result.ok(status);
  }

  private async markTransactionAsError(
    transactionId: string,
  ): Promise<Result<string>> {
    const updateErrorResult = await this.updateTransactionDB(
      transactionId,
      'ERROR',
    );
    return updateErrorResult.isSuccess
      ? Result.fail<string>(
          new Error('Failed to update transaction status to ERROR'),
        )
      : Result.ok('ERROR');
  }

  async getStatus(transactionId: string): Promise<Result<string>> {
    try {
      const response = await this.payService.getStatus(transactionId);
      if (!response.data) {
        return Result.fail<string>(new Error('Response data is missing'));
      }
      return Result.ok(response.data.status);
    } catch (error) {
      return Result.fail<string>(error as Error);
    }
  }

  private generateSignature(
    reference: string,
    amountInCents: string,
    currency: string,
    expirationTime: string,
  ): string {
    const integrityKey = process.env.INTEGRITY_KEY;
    const data = `${reference}${amountInCents}${currency}${expirationTime}${integrityKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
