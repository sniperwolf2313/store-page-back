import { Injectable } from '@nestjs/common';
import { DeliveryDbAdapter } from '../../adapters/delivery-db.adapter';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Result } from '../../utils/result';

@Injectable()
export class DeliveryService {
  constructor(private readonly deliveryDbAdapter: DeliveryDbAdapter) {}

  async createDeliveryDB(delivery: Delivery): Promise<Result<Delivery>> {
    const deliveryResult =
      await this.deliveryDbAdapter.createDeliveryDB(delivery);
    if (!deliveryResult.isSuccess) {
      return Result.fail(new Error('Failed to create delivery'));
    }
    return Result.ok(deliveryResult.value);
  }
}
