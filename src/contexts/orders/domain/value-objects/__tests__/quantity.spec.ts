import { Quantity } from '../quantity';

describe('Quantity', () => {
  describe('of', () => {
    it('should accept valid values 1-10', () => {
      const qty1 = Quantity.of(1);
      const qty5 = Quantity.of(5);
      const qty10 = Quantity.of(10);

      expect(qty1.getValue()).toBe(1);
      expect(qty5.getValue()).toBe(5);
      expect(qty10.getValue()).toBe(10);
    });

    it('should reject value 0', () => {
      expect(() => Quantity.of(0)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
    });

    it('should reject negative values', () => {
      expect(() => Quantity.of(-1)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
      expect(() => Quantity.of(-5)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
    });

    it('should reject values greater than 10', () => {
      expect(() => Quantity.of(11)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
      expect(() => Quantity.of(100)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
    });

    it('should reject fractional values', () => {
      expect(() => Quantity.of(1.5)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
      expect(() => Quantity.of(5.2)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
      expect(() => Quantity.of(9.99)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
    });
  });

  describe('add', () => {
    it('should return new Quantity with sum', () => {
      const qty1 = Quantity.of(3);
      const qty2 = Quantity.of(4);
      const result = qty1.add(qty2);

      expect(result.getValue()).toBe(7);
      // Original quantities unchanged (immutability)
      expect(qty1.getValue()).toBe(3);
      expect(qty2.getValue()).toBe(4);
    });

    it('should allow sum exactly equal to 10', () => {
      const qty1 = Quantity.of(6);
      const qty2 = Quantity.of(4);
      const result = qty1.add(qty2);

      expect(result.getValue()).toBe(10);
    });

    it('should throw when sum exceeds 10', () => {
      const qty1 = Quantity.of(6);
      const qty2 = Quantity.of(5);

      expect(() => qty1.add(qty2)).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const qty1 = Quantity.of(5);
      const qty2 = Quantity.of(5);

      expect(qty1.equals(qty2)).toBe(true);
    });

    it('should return false for different values', () => {
      const qty1 = Quantity.of(3);
      const qty2 = Quantity.of(7);

      expect(qty1.equals(qty2)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the numeric quantity value', () => {
      const quantity = Quantity.of(8);

      expect(quantity.getValue()).toBe(8);
      expect(typeof quantity.getValue()).toBe('number');
    });
  });
});
