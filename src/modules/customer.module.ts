import { Module } from '@nestjs/common';
import { CustomerService } from '../application/services/customer.service';
import { CustomerController } from '../controllers/customer.controller';
import { DynamoDBModule } from './dynamodb.module';
import { CustomerDbAdapter } from 'src/adapters/customer-db.adapter';

@Module({
  imports: [DynamoDBModule],
  providers: [CustomerService, CustomerDbAdapter],
  controllers: [CustomerController],
})
export class CustomerModule {}
