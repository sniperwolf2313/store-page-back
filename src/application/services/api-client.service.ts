import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { env } from 'process';

@Injectable()
export class PayService {
  readonly api_url = env.API_URL;
  readonly public_key = env.PUBLIC_KEY;
  readonly private_key = env.PRIVATE_KEY;
  constructor(private readonly httpService: HttpService) {}

  async getTokenMerchant(): Promise<AxiosResponse> {
    const url = `${this.api_url}/merchants/${this.public_key}`;
    const response = await this.httpService.get(url).toPromise();
    return response.data;
  }

  async getTokenCard(cardData: any): Promise<AxiosResponse> {
    const url = `${this.api_url}/tokens/cards`;
    const response = await this.httpService
      .post(url, cardData, {
        headers: {
          Authorization: `Bearer ${this.public_key}`,
        },
      })
      .toPromise();
    return response.data;
  }

  async getPaymentSource(paymentSourceData: any): Promise<AxiosResponse> {
    const url = `${this.api_url}/payment_sources`;

    const response = await this.httpService
      .post(url, paymentSourceData, {
        headers: {
          Authorization: `Bearer ${this.private_key}`,
        },
      })
      .toPromise();
    return response.data;
  }

  async createTransaction(transactionData: any): Promise<AxiosResponse> {
    const url = `${this.api_url}/transactions`;
    const response = await this.httpService
      .post(url, transactionData, {
        headers: {
          Authorization: `Bearer ${this.private_key}`,
        },
      })
      .toPromise();
    return response.data;
  }

  async getStatus(transactionId: string): Promise<AxiosResponse> {
    const url = `${this.api_url}/transactions/${transactionId}`;
    const response = await this.httpService
      .get(url, {
        headers: {
          Authorization: `Bearer ${this.private_key}`,
        },
      })
      .toPromise();
    return response.data;
  }
}
