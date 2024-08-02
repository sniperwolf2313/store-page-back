import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TransactionService } from '../application/services/transaction.service';
import { Transaction } from 'src/domain/entities/transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Post('create')
  async createTransactionDB(@Body() transaction: Transaction) {
    return this.transactionService.createTransactionDB(transaction);
  }

  @Patch(':transactionId')
  async updateTransaction(
    @Param('transactionId') transactionId: string,
    @Body('status') status: string,
  ) {
    return this.transactionService.updateTransactionDB(transactionId, status);
  }

  @Get('acceptance-token')
  async getAcceptanceToken() {
    return this.transactionService.getAcceptanceToken();
  }

  @Post('token-card')
  async getTokenCard(@Body() cardData: any) {
    return this.transactionService.getTokenCard(cardData);
  }

  @Post('/payment-source')
  async getPaymentSource(@Body() paymentSourceData: any) {
    try {
      return await this.transactionService.getPaymentSource(paymentSourceData);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.response ? error.response.data : 'Unknown error',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('create-transaction')
  async createTransaction(@Body() transactionData: any) {
    try {
      return await this.transactionService.createTransaction(transactionData);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.response ? error.response.data : 'Unknown error',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Get('status/:transactionId')
  async getStatus(@Param('transactionId') transactionId: string) {
    return this.transactionService.getStatus(transactionId);
  }
}
