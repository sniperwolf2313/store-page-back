import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'src/domain/entities/transaction.entity';

@Injectable()
export class TransactionDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async createTransactionDB(transaction: Transaction): Promise<Transaction> {
    const params = {
      TableName: 'Transactions',
      Item: transaction,
    };
    const command = new PutCommand(params);
    await this.dynamoDBClient.send(command);
    return transaction;
  }

  async getTransactionDB(transactionId: string): Promise<Transaction> {
    const params = {
      TableName: 'Transactions',
      Key: {
        transactionId: transactionId,
      },
    };
    const command = new GetCommand(params);
    const result = await this.dynamoDBClient.send(command);
    return result.Item as Transaction;
  }

  async updateTransactionDB(
    transactionId: string,
    status: string,
  ): Promise<Transaction> {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    if (!status) {
      throw new Error('Status is required');
    }

    const params = {
      TableName: 'Transactions',
      Key: {
        transactionId: transactionId,
      },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      ReturnValues: 'ALL_NEW',
    };

    console.log('DynamoDB update params:', params);

    const command = new UpdateCommand(params as UpdateCommandInput);
    const result = await this.dynamoDBClient.send(command);
    return result.Attributes as Transaction;
  }
}
