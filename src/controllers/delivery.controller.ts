import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DeliveryService } from '../application/services/delivery.service';
import { Delivery } from '../domain/entities/delivery.entity';
import { Result } from '../utils/result';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post('create')
  async createDeliveryDB(@Body() delivery: Delivery) {
    const result: Result<Delivery> =
      await this.deliveryService.createDeliveryDB(delivery);
    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        result.error.message,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
