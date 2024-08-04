import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomerService } from '../application/services/customer.service';
import { Customer } from '../domain/entities/customer.entity';
import { Result } from '../utils/result';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('create')
  async createCustomer(@Body() customer: Customer) {
    const result: Result<Customer> =
      await this.customerService.createCustomerDB(customer);
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
