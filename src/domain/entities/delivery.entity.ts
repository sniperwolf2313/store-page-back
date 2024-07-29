export class Delivery {
  constructor(
    public readonly deliveryId: string,
    public readonly transactionId: string,
    public readonly deliveryAddress: string,
    public readonly status: string,
    public readonly deliveryDate: Date,
  ) {}
}
