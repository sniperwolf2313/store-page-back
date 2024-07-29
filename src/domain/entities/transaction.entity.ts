export class Transaction {
  constructor(
    public readonly transactionId: string,
    public readonly productId: string,
    public readonly status: string,
    public readonly amount: number,
    public readonly createdAt: Date,
  ) {}
}
