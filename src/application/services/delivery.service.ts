import { Injectable } from '@nestjs/common';
import { DeliveryDbAdapter } from '../../adapters/delivery-db.adapter';
import { Delivery } from 'src/domain/entities/delivery.entity';

@Injectable()
export class DeliveryService {
  constructor(private readonly deliveryDbAdapter: DeliveryDbAdapter) {}
  async createDeliveryDB(delivery: Delivery): Promise<Delivery> {
    return this.deliveryDbAdapter.createDeliveryDB(delivery);
  }
}
