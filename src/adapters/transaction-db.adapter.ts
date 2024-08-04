import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'src/domain/entities/transaction.entity';
import { Result } from 'src/utils/result';

@Injectable()
export class TransactionDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async createTransactionDB(
    transaction: Transaction,
  ): Promise<Result<Transaction>> {
    try {
      const params = {
        TableName: 'Transactions',
        Item: transaction,
      };
      const command = new PutCommand(params);
      await this.dynamoDBClient.send(command);
      return Result.ok(transaction);
    } catch (error) {
      return Result.fail<Transaction>(error as Error);
    }
  }

  async getTransactionDB(transactionId: string): Promise<Result<Transaction>> {
    try {
      const params = {
        TableName: 'Transactions',
        Key: {
          transactionId: transactionId,
        },
      };
      const command = new GetCommand(params);
      const result = await this.dynamoDBClient.send(command);
      if (result.Item) {
        return Result.ok(result.Item as Transaction);
      } else {
        return Result.fail<Transaction>(new Error('Transaction not found'));
      }
    } catch (error) {
      return Result.fail<Transaction>(error as Error);
    }
  }

  async updateTransactionDB(
    transactionId: string,
    status: string,
  ): Promise<Result<Transaction>> {
    try {
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

      const command = new UpdateCommand(params as UpdateCommandInput);
      const result = await this.dynamoDBClient.send(command);
      return Result.ok(result.Attributes as Transaction);
    } catch (error) {
      return Result.fail<Transaction>(error as Error);
    }
  }
}
