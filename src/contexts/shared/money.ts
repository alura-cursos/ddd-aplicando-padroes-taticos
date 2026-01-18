export class Money {
  public readonly amount: number;
  public readonly currency: string;

  constructor(amount: number, currency: string) {
    this.validateAmount(amount);
    this.validateCurrency(currency);

    this.amount = this.roundToTwoDecimals(amount);
    this.currency = currency;
  }

  private validateAmount(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  private validateCurrency(currency: string): void {
    // Currency must be a 3-letter uppercase code (ISO 4217 format)
    const currencyRegex = /^[A-Z]{3}$/;
    if (!currencyRegex.test(currency)) {
      throw new Error('Currency must be a 3-letter ISO 4217 code');
    }
  }

  private roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Subtraction result cannot be negative');
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Cannot multiply by negative factor');
    }
    return new Money(this.amount * factor, this.currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot perform operation with different currencies: ${this.currency} and ${other.currency}`,
      );
    }
  }
}
