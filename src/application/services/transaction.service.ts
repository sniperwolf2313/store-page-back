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
      const amountInCents = transactionData.amount_in_cents.toString();
      const expirationTime = transactionData.expiration_time;
      transactionData.signature = this.generateSignature(
        transactionData.reference,
        amountInCents,
        transactionData.currency,
        expirationTime,
      );

      const response = await this.payService.createTransaction(transactionData);
      if (!response.data) {
        return Result.fail<string>(new Error('Response data is missing'));
      }

      const transactionResult = await this.createTransactionDB({
        transactionId: response.data.id,
        reference: response.data.reference,
        amountInCents: response.data.amount_in_cents,
        currency: response.data.currency,
        customerId: response.data.customer_data.legal_id,
        customerEmail: response.data.customer_email,
        paymentMethod: response.data.payment_method,
        status: response.data.status,
      });

      if (!transactionResult.isSuccess) {
        return Result.fail<string>(
          new Error('Failed to create transaction DB entry'),
        );
      }

      let responseStatusResult = await this.getStatus(response.data.id);
      if (!responseStatusResult.isSuccess) {
        return Result.fail<string>(
          new Error('Failed to retrieve transaction status'),
        );
      }

      let responseStatus = responseStatusResult.value;
      let tries = 0;
      while (responseStatus === 'PENDING' && tries < 10) {
        tries++;
        responseStatusResult = await this.getStatus(response.data.id);
        if (!responseStatusResult.isSuccess) {
          return Result.fail<string>(
            new Error('Failed to retrieve transaction status'),
          );
        }
        responseStatus = responseStatusResult.value;
      }

      if (responseStatus !== 'PENDING') {
        if (!response.data.id || !responseStatus) {
          return Result.fail<string>(
            new Error('Missing data for updating transaction DB'),
          );
        }

        const updateResult = await this.updateTransactionDB(
          response.data.id,
          responseStatus,
        );
        if (!updateResult.isSuccess) {
          return Result.fail<string>(
            new Error('Failed to update transaction status'),
          );
        }

        const customerResult = await this.customerService.createCustomerDB({
          customerId: response.data.customer_data.legal_id,
          idType: response.data.customer_data.legal_id_type,
          name: response.data.customer_data.full_name,
          email: response.data.customer_email,
          phone_number: response.data.customer_data.phone_number,
          deliveryAddress: response.data.shipping_address,
        });

        if (!customerResult.isSuccess) {
          return Result.fail<string>(
            new Error('Failed to create customer DB entry'),
          );
        }

        const deliveryResult = await this.deliveryService.createDeliveryDB({
          deliveryId: response.data.id,
          shippingData: response.data.shipping_address,
          status: responseStatus,
        });

        if (!deliveryResult.isSuccess) {
          return Result.fail<string>(
            new Error('Failed to create delivery DB entry'),
          );
        }
      } else {
        if (!response.data.id) {
          return Result.fail<string>(
            new Error('Missing data for updating transaction DB'),
          );
        }

        const updateErrorResult = await this.updateTransactionDB(
          response.data.id,
          'ERROR',
        );
        if (!updateErrorResult.isSuccess) {
          return Result.fail<string>(
            new Error('Failed to update transaction status to ERROR'),
          );
        }
      }

      return Result.ok(responseStatus);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return Result.fail<string>(error as Error);
    }
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
