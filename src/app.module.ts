import { Module } from '@nestjs/common';
import { ProductModule } from './modules/product.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './modules/transaction.module';
import { CustomerModule } from './modules/customer.module';
import { DeliveryModule } from './modules/delivery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProductModule,
    TransactionModule,
    CustomerModule,
    DeliveryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
