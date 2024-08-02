import { Module } from '@nestjs/common';
import { DeliveryService } from '../application/services/delivery.service';
import { DeliveryController } from '../controllers/delivery.controller';
import { DynamoDBModule } from './dynamodb.module';
import { DeliveryDbAdapter } from '../adapters/delivery-db.adapter';

@Module({
  imports: [DynamoDBModule],
  providers: [DeliveryService, DeliveryDbAdapter],
  controllers: [DeliveryController],
})
export class DeliveryModule {}
