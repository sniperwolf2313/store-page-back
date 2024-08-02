import { Controller, Post, Body } from '@nestjs/common';
import { CustomerService } from '../application/services/customer.service';
import { Customer } from '../domain/entities/customer.entity';

@Controller('customers')
export class CustomerController {
  constructor(private CustomerService: CustomerService) {}

  @Post('create')
  async createCustomerDB(@Body() customer: Customer) {
    return this.CustomerService.createCustomerDB(customer);
  }
}
