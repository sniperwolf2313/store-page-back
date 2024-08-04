import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Delivery } from 'src/domain/entities/delivery.entity';
import { Result } from 'src/utils/result';

@Injectable()
export class DeliveryDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async createDeliveryDB(delivery: Delivery): Promise<Result<Delivery>> {
    const params: PutCommandInput = {
      TableName: 'Delivery',
      Item: delivery,
    };
    const command = new PutCommand(params);

    try {
      await this.dynamoDBClient.send(command);
      return Result.ok(delivery);
    } catch (error) {
      return Result.fail(new Error('Failed to create delivery in DB'));
    }
  }
}
