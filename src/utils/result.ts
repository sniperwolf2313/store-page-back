export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly error?: Error,
    private readonly _value?: T,
  ) {}

  public get value(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of an error result.');
    }
    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: Error): Result<U> {
    return new Result<U>(false, error);
  }

  public static combine(results: Result<any>[]): Result<void> {
    for (const result of results) {
      if (!result.isSuccess) return result;
    }
    return Result.ok();
  }
}
