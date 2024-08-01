import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { Product } from 'src/domain/entities/product.entity';

@Injectable()
export class ProductDbAdapter {
  constructor(
    @Inject('DYNAMO_DB')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    const params = {
      TableName: 'Products',
    };
    const command = new ScanCommand(params);
    const result = await this.dynamoDBClient.send(command);
    return result.Items as Product[];
  }

  async getProduct(productId: string): Promise<Product> {
    const params = {
      TableName: 'Products',
      Key: {
        productId: productId,
      },
    };
    const command = new GetCommand(params);
    const result = await this.dynamoDBClient.send(command);
    return result.Item as Product;
  }

  async updateProduct(productId: string, stock: number): Promise<Product> {
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
    return result.Attributes as Product;
  }
}
