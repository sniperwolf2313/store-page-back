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
import { Transaction } from '../domain/entities/transaction.entity';
import { Result } from '../utils/result';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create')
  async createTransactionDB(@Body() transaction: Transaction) {
    const result: Result<Transaction> =
      await this.transactionService.createTransactionDB(transaction);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: result.error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Patch(':transactionId')
  async updateTransaction(
    @Param('transactionId') transactionId: string,
    @Body('status') status: string,
  ) {
    const result: Result<Transaction> =
      await this.transactionService.updateTransactionDB(transactionId, status);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: result.error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Get('acceptance-token')
  async getAcceptanceToken() {
    const result: Result<string> =
      await this.transactionService.getAcceptanceToken();
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: result.error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('token-card')
  async getTokenCard(@Body() cardData: any) {
    const result: Result<string> =
      await this.transactionService.getTokenCard(cardData);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: result.error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('/payment-source')
  async getPaymentSource(@Body() paymentSourceData: any) {
    const result: Result<any> =
      await this.transactionService.getPaymentSource(paymentSourceData);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: result.error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('create-transaction')
  async createTransaction(@Body() transactionData: any) {
    const result: Result<string> =
      await this.transactionService.createTransaction(transactionData);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: result.error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Get('status/:transactionId')
  async getStatus(@Param('transactionId') transactionId: string) {
    const result: Result<any> =
      await this.transactionService.getStatus(transactionId);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: result.error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
