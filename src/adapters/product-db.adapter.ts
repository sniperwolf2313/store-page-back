import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Product } from 'src/domain/entities/product.entity';
import { Result } from 'src/utils/result';

@Injectable()
export class ProductDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async getAllProducts(): Promise<Result<Product[]>> {
    try {
      const params = {
        TableName: 'Products',
      };
      const command = new ScanCommand(params);
      const result = await this.dynamoDBClient.send(command);
      return Result.ok(result.Items as Product[]);
    } catch (error) {
      return Result.fail<Product[]>(error as Error);
    }
  }

  async getProduct(productId: string): Promise<Result<Product>> {
    try {
      const params = {
        TableName: 'Products',
        Key: {
          productId: productId,
        },
      };
      const command = new GetCommand(params);
      const result = await this.dynamoDBClient.send(command);
      return Result.ok(result.Item as Product);
    } catch (error) {
      return Result.fail<Product>(error as Error);
    }
  }

  async updateProduct(
    productId: string,
    stock: number,
  ): Promise<Result<Product>> {
    try {
      const params = {
        TableName: 'Products',
        Key: {
          productId: productId,
        },
        UpdateExpression: 'set stock = :stock',
        ExpressionAttributeValues: {
          ':stock': stock,
        },
        ReturnValues: 'ALL_NEW',
      };
      const command = new UpdateCommand(params as UpdateCommandInput);
      const result = await this.dynamoDBClient.send(command);
      return Result.ok(result.Attributes as Product);
    } catch (error) {
      return Result.fail<Product>(error as Error);
    }
  }
}
