import { Module } from '@nestjs/common';
import { ProductService } from '../application/services/product.service';
import { ProductController } from '../controllers/product.controller';
import { DynamoDBModule } from './dynamodb.module';
import { ProductDbAdapter } from 'src/adapters/product-db.adapter';

@Module({
  imports: [DynamoDBModule],
  providers: [ProductService, ProductDbAdapter],
  controllers: [ProductController],
})
export class ProductModule {}
