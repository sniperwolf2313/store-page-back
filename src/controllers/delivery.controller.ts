import { Controller, Post, Body } from '@nestjs/common';
import { DeliveryService } from '../application/services/delivery.service';
import { Delivery } from '../domain/entities/delivery.entity';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post('create')
  async createDeliveryDB(@Body() delivery: Delivery) {
    return this.deliveryService.createDeliveryDB(delivery);
  }
}
