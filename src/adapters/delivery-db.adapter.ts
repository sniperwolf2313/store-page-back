import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Delivery } from 'src/domain/entities/delivery.entity';

@Injectable()
export class DeliveryDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async createDeliveryDB(delivery: Delivery): Promise<Delivery> {
    const params = {
      TableName: 'Delivery',
      Item: delivery,
    };
    const command = new PutCommand(params);
    await this.dynamoDBClient.send(command);
    return delivery;
  }
}
