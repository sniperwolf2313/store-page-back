import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { env } from 'process';

@Injectable()
export class PayService {
  readonly api_url = env.API_URL;
  readonly public_key = env.PUBLIC_KEY;
  readonly private_key = env.PRIVATE_KEY;
  constructor(private readonly httpService: HttpService) {}

  async getTokenMerchant(): Promise<any> {
    const url = `${this.api_url}/merchants/${this.public_key}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      console.error('Error fetching merchant token:', error);
      throw error;
    }
  }

  async getTokenCard(cardData: any): Promise<any> {
    const url = `${this.api_url}/tokens/cards`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, cardData, {
          headers: {
            Authorization: `Bearer ${this.public_key}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching token card:', error);
      throw error;
    }
  }

  async getPaymentSource(paymentSourceData: any): Promise<any> {
    const url = `${this.api_url}/payment_sources`;
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, paymentSourceData, {
          headers: {
            Authorization: `Bearer ${this.private_key}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment source:', error);
      throw error;
    }
  }

  async createTransaction(transactionData: any): Promise<any> {
    const url = `${this.api_url}/transactions`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, transactionData, {
          headers: {
            Authorization: `Bearer ${this.private_key}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getStatus(transactionId: string): Promise<any> {
    const url = `${this.api_url}/transactions/${transactionId}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.private_key}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      throw error;
    }
  }
}
