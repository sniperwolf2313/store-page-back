import { Test, TestingModule } from '@nestjs/testing';
import { PayService } from '../../application/services/api-client.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('PayService', () => {
  let payService: PayService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    payService = module.get<PayService>(PayService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(payService).toBeDefined();
  });

  describe('getTokenMerchant', () => {
    it('should return merchant token', async () => {
      const mockResponse = { data: { token: 'mockToken' } } as AxiosResponse;
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      const result = await payService.getTokenMerchant();
      expect(result).toEqual(mockResponse.data);
      expect(httpService.get).toHaveBeenCalledWith(
        `${payService.api_url}/merchants/${payService.public_key}`,
      );
    });
  });

  describe('getTokenCard', () => {
    it('should return card token', async () => {
      const mockCardData = { card: 'mockCard' };
      const mockResponse = { data: { token: 'mockToken' } } as AxiosResponse;
      jest.spyOn(httpService, 'post').mockReturnValueOnce(of(mockResponse));

      const result = await payService.getTokenCard(mockCardData);
      expect(result).toEqual(mockResponse.data);
      expect(httpService.post).toHaveBeenCalledWith(
        `${payService.api_url}/tokens/cards`,
        mockCardData,
        {
          headers: { Authorization: `Bearer ${payService.public_key}` },
        },
      );
    });
  });

  describe('getPaymentSource', () => {
    it('should return payment source', async () => {
      const mockPaymentSourceData = { source: 'mockSource' };
      const mockResponse = {
        data: { source: 'mockSourceResponse' },
      } as AxiosResponse;
      jest.spyOn(httpService, 'post').mockReturnValueOnce(of(mockResponse));

      const result = await payService.getPaymentSource(mockPaymentSourceData);
      expect(result).toEqual(mockResponse.data);
      expect(httpService.post).toHaveBeenCalledWith(
        `${payService.api_url}/payment_sources`,
        mockPaymentSourceData,
        {
          headers: { Authorization: `Bearer ${payService.private_key}` },
        },
      );
    });
  });

  describe('createTransaction', () => {
    it('should return transaction', async () => {
      const mockTransactionData = { transaction: 'mockTransaction' };
      const mockResponse = {
        data: { transaction: 'mockTransactionResponse' },
      } as AxiosResponse;
      jest.spyOn(httpService, 'post').mockReturnValueOnce(of(mockResponse));

      const result = await payService.createTransaction(mockTransactionData);
      expect(result).toEqual(mockResponse.data);
      expect(httpService.post).toHaveBeenCalledWith(
        `${payService.api_url}/transactions`,
        mockTransactionData,
        {
          headers: { Authorization: `Bearer ${payService.private_key}` },
        },
      );
    });
  });

  describe('getStatus', () => {
    it('should return transaction status', async () => {
      const mockTransactionId = '12345';
      const mockResponse = { data: { status: 'mockStatus' } } as AxiosResponse;
      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      const result = await payService.getStatus(mockTransactionId);
      expect(result).toEqual(mockResponse.data);
      expect(httpService.get).toHaveBeenCalledWith(
        `${payService.api_url}/transactions/${mockTransactionId}`,
        {
          headers: { Authorization: `Bearer ${payService.private_key}` },
        },
      );
    });
  });
});
