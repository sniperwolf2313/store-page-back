import { Module } from '@nestjs/common';
import { TransactionService } from '../application/services/transaction.service';
import { TransactionController } from '../controllers/transaction.controller';
import { DynamoDBModule } from './dynamodb.module';
import { TransactionDbAdapter } from 'src/adapters/transaction-db.adapter';
import { PayService } from '../application/services/api-client.service';
import { HttpModule } from '@nestjs/axios';
import { CustomerService } from 'src/application/services/customer.service';
import { DeliveryService } from 'src/application/services/delivery.service';
import { CustomerDbAdapter } from 'src/adapters/customer-db.adapter';
import { DeliveryDbAdapter } from 'src/adapters/delivery-db.adapter';

@Module({
  imports: [DynamoDBModule, HttpModule],
  providers: [
    TransactionService,
    TransactionDbAdapter,
    PayService,
    CustomerService,
    CustomerDbAdapter,
    DeliveryService,
    DeliveryDbAdapter,
  ],
  controllers: [TransactionController],
})
export class TransactionModule {}
