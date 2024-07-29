export class Product {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly price: number,
    public readonly description: string,
    public readonly stock: number,
    public readonly imageURL: string,
  ) {}
}
