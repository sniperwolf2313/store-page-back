import { Injectable } from '@nestjs/common';
import { CustomerDbAdapter } from '../../adapters/customer-db.adapter';
import { Customer } from '../../domain/entities/customer.entity';
import { Result } from '../../utils/result';

@Injectable()
export class CustomerService {
  constructor(private readonly customerDbAdapter: CustomerDbAdapter) {}

  async createCustomerDB(customer: Customer): Promise<Result<Customer>> {
    const customerResult =
      await this.customerDbAdapter.createCustomerDB(customer);
    if (!customerResult.isSuccess) {
      return Result.fail(new Error('Failed to create customer'));
    }
    return Result.ok(customerResult.value);
  }
}
