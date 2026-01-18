import { Money } from '../../shared/money';
import { ProductId } from '../../shared/product-id';
import { Quantity } from '../../shared/quantity';
import { OrderItem } from '../order-item';

describe('OrderItem Entity', () => {
  const createValidProductId = (): ProductId => {
    return ProductId.fromString('COFFEE-COL-001');
  };

  const createValidQuantity = (): Quantity => {
    return Quantity.of(2);
  };

  const createValidUnitPrice = (): Money => {
    return new Money(49.99, 'USD');
  };

  const createValidItemDiscount = (): Money => {
    return new Money(5.0, 'USD');
  };

  describe('Factory Method: create', () => {
    it('should create an OrderItem with valid parameters', () => {
      const productId = createValidProductId();
      const quantity = createValidQuantity();
      const unitPrice = createValidUnitPrice();
      const itemDiscount = createValidItemDiscount();

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        itemDiscount,
      );

      expect(orderItem).toBeDefined();
      expect(orderItem.productId).toBe(productId);
      expect(orderItem.quantity).toBe(quantity);
      expect(orderItem.unitPrice).toBe(unitPrice);
      expect(orderItem.itemDiscount).toBe(itemDiscount);
    });

    it('should create an OrderItem with zero discount', () => {
      const productId = createValidProductId();
      const quantity = createValidQuantity();
      const unitPrice = createValidUnitPrice();
      const zeroDiscount = new Money(0, 'USD');

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        zeroDiscount,
      );

      expect(orderItem.itemDiscount.amount).toBe(0);
      expect(orderItem.itemDiscount.isZero()).toBe(true);
    });
  });

  describe('Line Total Calculation', () => {
    it('should calculate line total correctly: (unitPrice × quantity) - itemDiscount', () => {
      const productId = createValidProductId();
      const quantity = Quantity.of(3);
      const unitPrice = new Money(20.0, 'USD');
      const itemDiscount = new Money(5.0, 'USD');

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        itemDiscount,
      );

      const lineTotal = orderItem.getLineTotal();

      // (20.00 * 3) - 5.00 = 60.00 - 5.00 = 55.00
      expect(lineTotal.amount).toBe(55.0);
      expect(lineTotal.currency).toBe('USD');
    });

    it('should calculate line total correctly with zero discount', () => {
      const productId = createValidProductId();
      const quantity = Quantity.of(2);
      const unitPrice = new Money(49.99, 'USD');
      const zeroDiscount = new Money(0, 'USD');

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        zeroDiscount,
      );

      const lineTotal = orderItem.getLineTotal();

      // (49.99 * 2) - 0 = 99.98
      expect(lineTotal.amount).toBe(99.98);
    });

    it('should calculate line total correctly with quantity of 1', () => {
      const productId = createValidProductId();
      const quantity = Quantity.of(1);
      const unitPrice = new Money(100.0, 'USD');
      const itemDiscount = new Money(10.0, 'USD');

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        itemDiscount,
      );

      const lineTotal = orderItem.getLineTotal();

      // (100.00 * 1) - 10.00 = 90.00
      expect(lineTotal.amount).toBe(90.0);
    });

    it('should handle rounding correctly for monetary calculations', () => {
      const productId = createValidProductId();
      const quantity = Quantity.of(3);
      const unitPrice = new Money(9.99, 'USD');
      const itemDiscount = new Money(0.5, 'USD');

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        itemDiscount,
      );

      const lineTotal = orderItem.getLineTotal();

      // (9.99 * 3) - 0.50 = 29.97 - 0.50 = 29.47
      expect(lineTotal.amount).toBe(29.47);
    });
  });

  describe('Currency Consistency', () => {
    it('should throw error if unitPrice and itemDiscount have different currencies', () => {
      const productId = createValidProductId();
      const quantity = createValidQuantity();
      const unitPriceUSD = new Money(49.99, 'USD');
      const discountEUR = new Money(5.0, 'EUR');

      expect(() => {
        OrderItem.create(productId, quantity, unitPriceUSD, discountEUR);
      }).toThrow('Cannot perform operation with different currencies');
    });

    it('should allow creation when both unitPrice and itemDiscount have same currency', () => {
      const productId = createValidProductId();
      const quantity = createValidQuantity();
      const unitPriceEUR = new Money(49.99, 'EUR');
      const discountEUR = new Money(5.0, 'EUR');

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPriceEUR,
        discountEUR,
      );

      expect(orderItem.unitPrice.currency).toBe('EUR');
      expect(orderItem.itemDiscount.currency).toBe('EUR');
      expect(orderItem.getLineTotal().currency).toBe('EUR');
    });
  });

  describe('Discount Validation', () => {
    it('should reject discount greater than total price (unitPrice × quantity)', () => {
      const productId = createValidProductId();
      const quantity = Quantity.of(2);
      const unitPrice = new Money(10.0, 'USD');
      const excessiveDiscount = new Money(25.0, 'USD'); // Greater than 10 * 2 = 20

      expect(() => {
        OrderItem.create(productId, quantity, unitPrice, excessiveDiscount);
      }).toThrow('Subtraction result cannot be negative');
    });

    it('should allow discount equal to total price (resulting in zero line total)', () => {
      const productId = createValidProductId();
      const quantity = Quantity.of(2);
      const unitPrice = new Money(10.0, 'USD');
      const fullDiscount = new Money(20.0, 'USD'); // Equal to 10 * 2 = 20

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        fullDiscount,
      );

      const lineTotal = orderItem.getLineTotal();
      expect(lineTotal.amount).toBe(0);
      expect(lineTotal.isZero()).toBe(true);
    });
  });

  describe('Immutability', () => {
    it('should have readonly properties that cannot be reassigned', () => {
      const productId = createValidProductId();
      const quantity = createValidQuantity();
      const unitPrice = createValidUnitPrice();
      const itemDiscount = createValidItemDiscount();

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        itemDiscount,
      );

      // TypeScript compile-time check ensures these are readonly
      // Runtime verification that properties exist
      expect(orderItem.productId).toBeDefined();
      expect(orderItem.quantity).toBeDefined();
      expect(orderItem.unitPrice).toBeDefined();
      expect(orderItem.itemDiscount).toBeDefined();
    });

    it('should return consistent lineTotal on multiple calls', () => {
      const productId = createValidProductId();
      const quantity = createValidQuantity();
      const unitPrice = createValidUnitPrice();
      const itemDiscount = createValidItemDiscount();

      const orderItem = OrderItem.create(
        productId,
        quantity,
        unitPrice,
        itemDiscount,
      );

      const lineTotal1 = orderItem.getLineTotal();
      const lineTotal2 = orderItem.getLineTotal();

      expect(lineTotal1.amount).toBe(lineTotal2.amount);
      expect(lineTotal1.currency).toBe(lineTotal2.currency);
    });
  });
});
