export class BusinessError extends Error {
  public status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}
