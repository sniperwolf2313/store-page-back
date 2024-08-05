import { Test, TestingModule } from '@nestjs/testing';
import { CustomerDbAdapter } from '../../adapters/customer-db.adapter';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Customer } from '../../domain/entities/customer.entity';

const mockDynamoDBClient = {
  send: jest.fn(),
};

describe('CustomerDbAdapter', () => {
  let adapter: CustomerDbAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerDbAdapter,
        { provide: 'DYNAMO_DB', useValue: mockDynamoDBClient },
      ],
    }).compile();

    adapter = module.get<CustomerDbAdapter>(CustomerDbAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('createCustomerDB', () => {
    it('should successfully create a customer in DB', async () => {
      const customer: Customer = {
        customerId: '1',
        idType: 'ID',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone_number: '1234567890',
        deliveryAddress: '123 Street, City, Country',
      };

      mockDynamoDBClient.send.mockResolvedValueOnce({});

      const result = await adapter.createCustomerDB(customer);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(customer);
      expect(mockDynamoDBClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand),
      );
      const putCommand = mockDynamoDBClient.send.mock.calls[0][0] as PutCommand;
      expect(putCommand.input).toEqual({
        TableName: 'Customers',
        Item: customer,
      });
    });

    it('should return failure result when there is an error', async () => {
      const customer: Customer = {
        customerId: '1',
        idType: 'ID',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone_number: '1234567890',
        deliveryAddress: '123 Street, City, Country',
      };

      mockDynamoDBClient.send.mockRejectedValueOnce(
        new Error('DynamoDB error'),
      );

      const result = await adapter.createCustomerDB(customer);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(
        new Error('Failed to create customer in DB'),
      );
    });
  });
});
