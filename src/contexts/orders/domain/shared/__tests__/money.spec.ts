import { Money } from '../money';

describe('Money', () => {
  describe('creation', () => {
    it('should create money with valid amount and currency', () => {
      const money = new Money(99.99, 'USD');

      expect(money.amount).toBe(99.99);
      expect(money.currency).toBe('USD');
    });

    it('should round amount to 2 decimal places', () => {
      const money = new Money(99.999, 'USD');

      expect(money.amount).toBe(100);
    });

    it('should accept zero as valid amount', () => {
      const money = new Money(0, 'EUR');

      expect(money.amount).toBe(0);
      expect(money.isZero()).toBe(true);
    });

    it('should reject negative amounts', () => {
      expect(() => new Money(-10.0, 'USD')).toThrow(
        'Amount cannot be negative',
      );
    });

    it('should reject invalid currency code format', () => {
      expect(() => new Money(100, 'US')).toThrow(
        'Currency must be a 3-letter ISO 4217 code',
      );
      expect(() => new Money(100, 'USDD')).toThrow(
        'Currency must be a 3-letter ISO 4217 code',
      );
      expect(() => new Money(100, 'us$')).toThrow(
        'Currency must be a 3-letter ISO 4217 code',
      );
    });

    it('should accept valid ISO 4217 currency codes', () => {
      expect(() => new Money(100, 'USD')).not.toThrow();
      expect(() => new Money(100, 'EUR')).not.toThrow();
      expect(() => new Money(100, 'BRL')).not.toThrow();
      expect(() => new Money(100, 'GBP')).not.toThrow();
    });
  });

  describe('equality', () => {
    it('should be equal when amount and currency are the same', () => {
      const money1 = new Money(99.99, 'USD');
      const money2 = new Money(99.99, 'USD');

      expect(money1.equals(money2)).toBe(true);
    });

    it('should not be equal when amounts differ', () => {
      const money1 = new Money(99.99, 'USD');
      const money2 = new Money(100.0, 'USD');

      expect(money1.equals(money2)).toBe(false);
    });

    it('should not be equal when currencies differ', () => {
      const money1 = new Money(99.99, 'USD');
      const money2 = new Money(99.99, 'EUR');

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('add', () => {
    it('should add two money values with same currency', () => {
      const money1 = new Money(50.0, 'USD');
      const money2 = new Money(30.0, 'USD');

      const result = money1.add(money2);

      expect(result.amount).toBe(80.0);
      expect(result.currency).toBe('USD');
    });

    it('should throw error when adding different currencies', () => {
      const money1 = new Money(50.0, 'USD');
      const money2 = new Money(30.0, 'EUR');

      expect(() => money1.add(money2)).toThrow(
        'Cannot perform operation with different currencies: USD and EUR',
      );
    });
  });

  describe('subtract', () => {
    it('should subtract two money values with same currency', () => {
      const money1 = new Money(100.0, 'USD');
      const money2 = new Money(30.0, 'USD');

      const result = money1.subtract(money2);

      expect(result.amount).toBe(70.0);
      expect(result.currency).toBe('USD');
    });

    it('should throw error when result would be negative', () => {
      const money1 = new Money(30.0, 'USD');
      const money2 = new Money(50.0, 'USD');

      expect(() => money1.subtract(money2)).toThrow(
        'Subtraction result cannot be negative',
      );
    });

    it('should throw error when subtracting different currencies', () => {
      const money1 = new Money(100.0, 'USD');
      const money2 = new Money(30.0, 'EUR');

      expect(() => money1.subtract(money2)).toThrow(
        'Cannot perform operation with different currencies: USD and EUR',
      );
    });
  });

  describe('multiply', () => {
    it('should multiply money by positive factor', () => {
      const money = new Money(10.0, 'USD');

      const result = money.multiply(3);

      expect(result.amount).toBe(30.0);
      expect(result.currency).toBe('USD');
    });

    it('should multiply by zero', () => {
      const money = new Money(10.0, 'USD');

      const result = money.multiply(0);

      expect(result.amount).toBe(0);
      expect(result.isZero()).toBe(true);
    });

    it('should throw error when multiplying by negative factor', () => {
      const money = new Money(10.0, 'USD');

      expect(() => money.multiply(-2)).toThrow(
        'Cannot multiply by negative factor',
      );
    });

    it('should round result to 2 decimal places', () => {
      const money = new Money(10.0, 'USD');

      const result = money.multiply(0.333);

      expect(result.amount).toBe(3.33);
    });
  });

  describe('isZero', () => {
    it('should return true for zero amount', () => {
      const money = new Money(0, 'USD');

      expect(money.isZero()).toBe(true);
    });

    it('should return false for non-zero amount', () => {
      const money = new Money(0.01, 'USD');

      expect(money.isZero()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format as "amount currency"', () => {
      const money = new Money(99.99, 'USD');

      expect(money.toString()).toBe('99.99 USD');
    });

    it('should format zero correctly', () => {
      const money = new Money(0, 'EUR');

      expect(money.toString()).toBe('0.00 EUR');
    });
  });

  describe('immutability', () => {
    it('should not mutate original money when adding', () => {
      const money1 = new Money(50.0, 'USD');
      const money2 = new Money(30.0, 'USD');

      money1.add(money2);

      expect(money1.amount).toBe(50.0);
      expect(money2.amount).toBe(30.0);
    });

    it('should not mutate original money when subtracting', () => {
      const money1 = new Money(100.0, 'USD');
      const money2 = new Money(30.0, 'USD');

      money1.subtract(money2);

      expect(money1.amount).toBe(100.0);
      expect(money2.amount).toBe(30.0);
    });

    it('should not mutate original money when multiplying', () => {
      const money = new Money(10.0, 'USD');

      money.multiply(3);

      expect(money.amount).toBe(10.0);
    });
  });
});
