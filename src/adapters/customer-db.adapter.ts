import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '../domain/entities/customer.entity';
import { Result } from '../utils/result';

@Injectable()
export class CustomerDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async createCustomerDB(customer: Customer): Promise<Result<Customer>> {
    const params: PutCommandInput = {
      TableName: 'Customers',
      Item: customer,
    };
    const command = new PutCommand(params);

    try {
      await this.dynamoDBClient.send(command);
      return Result.ok(customer);
    } catch (error) {
      return Result.fail(new Error('Failed to create customer in DB'));
    }
  }
}
