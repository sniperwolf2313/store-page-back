import { Injectable } from '@nestjs/common';
import { TransactionDbAdapter } from '../../adapters/transaction-db.adapter';
import { Transaction } from 'src/domain/entities/transaction.entity';
import { PayService } from './api-client.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { CustomerService } from './customer.service';
import { DeliveryService } from './delivery.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionDbAdapter: TransactionDbAdapter,
    private readonly payService: PayService,
    private readonly customerService: CustomerService,
    private readonly deliveryService: DeliveryService,
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
        throw new Error('Response data is missing');
      }

      console.log('Response data:', response.data);

      if ('status' in response.data) {
        await this.createTransactionDB({
          transactionId: response.data.id,
          reference: response.data.reference,
          amountInCents: response.data.amount_in_cents,
          currency: response.data.currency,
          customerId: response.data.customer_data.legal_id,
          customerEmail: response.data.customer_email,
          paymentMethod: response.data.payment_method,
          status: response.data.status,
        });
      } else {
        throw new Error('Status not found in response data');
      }

      let responseStatus = await this.getStatus(response.data.id);
      let tries = 0;
      while (responseStatus.status === 'PENDING' && tries < 10) {
        tries++;
        responseStatus = await this.getStatus(response.data.id);
      }

      console.log('Transaction ID:', response.data.id);
      console.log('Response Status:', responseStatus.status);

      if (responseStatus.status !== 'PENDING') {
        if (!response.data.id || !responseStatus.status) {
          throw new Error('Missing data for updating transaction DB');
        }

        await this.updateTransactionDB(response.data.id, responseStatus.status);

        await this.customerService.createCustomerDB({
          customerId: response.data.customer_data.legal_id,
          idType: response.data.customer_data.legal_id_type,
          name: response.data.customer_data.full_name,
          email: response.data.customer_email,
          phone_number: response.data.customer_data.phone_number,
          deliveryAddress: response.data.shipping_address,
        });

        await this.deliveryService.createDeliveryDB({
          deliveryId: response.data.id,
          shippingData: response.data.shipping_address,
          status: responseStatus.status,
        });
      } else {
        if (!response.data.id) {
          throw new Error('Missing data for updating transaction DB');
        }

        await this.updateTransactionDB(response.data.id, 'ERROR');
      }
      return responseStatus.status;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getStatus(transactionId: string) {
    const response = await this.payService.getStatus(transactionId);
    return response.data;
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
