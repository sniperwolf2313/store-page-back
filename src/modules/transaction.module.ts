import { Module } from '@nestjs/common';
import { TransactionService } from '../application/services/transaction.service';
import { TransactionController } from '../controllers/transaction.controller';
import { DynamoDBModule } from './dynamodb.module';
import { TransactionDbAdapter } from 'src/adapters/transaction-db.adapter';
import { PayService } from '../application/services/api-client.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DynamoDBModule, HttpModule],
  providers: [TransactionService, TransactionDbAdapter, PayService],
  controllers: [TransactionController],
})
export class TransactionModule {}
