import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/domain/entities/customer.entity';

@Injectable()
export class CustomerDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async createCustomerDB(customer: Customer): Promise<Customer> {
    const params = {
      TableName: 'Customers',
      Item: customer,
    };
    const command = new PutCommand(params);
    await this.dynamoDBClient.send(command);
    return customer;
  }
}
