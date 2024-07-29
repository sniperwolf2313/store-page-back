export class Payment {
  constructor(
    public readonly paymentId: string,
    public readonly transactionId: string,
    public readonly amount: number,
    public readonly status: string,
    public readonly paymentDate: Date,
  ) {}
}
