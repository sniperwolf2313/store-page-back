import { Injectable } from '@nestjs/common';
import { CustomerDbAdapter } from '../../adapters/customer-db.adapter';
import { Customer } from 'src/domain/entities/customer.entity';

@Injectable()
export class CustomerService {
  constructor(private readonly customerDbAdapter: CustomerDbAdapter) {}
  async createCustomerDB(customer: Customer): Promise<Customer> {
    return this.customerDbAdapter.createCustomerDB(customer);
  }
}
