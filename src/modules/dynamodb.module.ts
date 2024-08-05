import { Module } from '@nestjs/common';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

@Module({
  providers: [
    {
      provide: 'DYNAMO_DB',
      useFactory: () => {
        const client = new DynamoDBClient({ region: 'us-east-1' });
        return DynamoDBDocumentClient.from(client);
      },
    },
  ],
  exports: ['DYNAMO_DB'],
})
export class DynamoDBModule {}
