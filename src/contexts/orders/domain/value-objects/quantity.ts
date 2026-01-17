export class Quantity {
  private static readonly MIN_VALUE = 1;
  private static readonly MAX_VALUE = 10;

  private readonly value: number;

  private constructor(value: number) {
    this.validateQuantity(value);
    this.value = value;
  }

  static of(value: number): Quantity {
    return new Quantity(value);
  }

  private validateQuantity(value: number): void {
    if (!Number.isInteger(value)) {
      throw new Error('Quantity must be an integer between 1 and 10');
    }

    if (value < Quantity.MIN_VALUE || value > Quantity.MAX_VALUE) {
      throw new Error('Quantity must be an integer between 1 and 10');
    }
  }

  getValue(): number {
    return this.value;
  }

  add(other: Quantity): Quantity {
    const sum = this.value + other.value;
    return Quantity.of(sum);
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
