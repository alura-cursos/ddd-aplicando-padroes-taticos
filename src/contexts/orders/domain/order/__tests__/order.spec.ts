import { Money } from '../../../../shared/money';
import { CustomerId } from '../../shared/customer-id';
import { ProductId } from '../../shared/product-id';
import { Quantity } from '../../shared/quantity';
import { CartId } from '../../shopping-cart/cart-id';
import { CartItem } from '../../shopping-cart/cart-item';
import { Order } from '../order';
import { OrderId } from '../order-id';
import { OrderItem } from '../order-item';
import { OrderStatus } from '../order-status';
import { ShippingAddress } from '../shipping-address';

// Test helper functions for inline test data creation
const createTestShippingAddress = () =>
  new ShippingAddress({
    street: '123 Main St',
    city: 'Springfield',
    stateOrProvince: 'IL',
    postalCode: '62701',
    country: 'USA',
  });

const createTestOrderItemLine = (overrides?: {
  productId?: string;
  quantity?: number;
  unitPrice?: Money;
  itemDiscount?: Money;
}) => ({
  cartItem: CartItem.create(
    ProductId.fromString(overrides?.productId || 'TEST-SKU-001'),
    Quantity.of(overrides?.quantity || 1),
  ),
  unitPrice: overrides?.unitPrice || new Money(100.0, 'USD'),
  discount: overrides?.itemDiscount || new Money(0, 'USD'),
});

const createTestOrder = () =>
  Order.create({
    cartId: CartId.create(),
    customerId: CustomerId.fromString('customer-123'),
    items: [createTestOrderItemLine()],
    shippingAddress: createTestShippingAddress(),
    globalDiscount: new Money(0, 'USD'),
  });

describe('Order Aggregate', () => {
  describe('Factory Method: create', () => {
    it('should create an Order in AwaitingPayment status with valid parameters', () => {
      const items = [createTestOrderItemLine()];
      const cartId = CartId.create();
      const customerId = CustomerId.fromString('customer-123');
      const shippingAddress = createTestShippingAddress();
      const globalDiscount = new Money(0, 'USD');

      const order = Order.create({
        cartId,
        customerId,
        items,
        shippingAddress,
        globalDiscount: globalDiscount,
      });

      expect(order).toBeDefined();
      expect(order.orderId).toBeInstanceOf(OrderId);
      expect(order.cartId).toBe(cartId);
      expect(order.customerId).toBe(customerId);
      expect(order.items).toHaveLength(1);
      expect(order.items[0]).toBeInstanceOf(OrderItem);
      expect(order.shippingAddress).toBe(shippingAddress);
      expect(order.status).toEqual(OrderStatus.asAwaitingPayment());
      expect(order.globalDiscount).toBe(globalDiscount);
      expect(order.paymentId).toBeNull();
    });

    it('should throw error when created with empty items array', () => {
      const cartId = CartId.create();
      const customerId = CustomerId.fromString('customer-123');
      const globalDiscount = new Money(0, 'USD');

      expect(() => {
        Order.create({
          cartId,
          customerId,
          items: [],
          shippingAddress: createTestShippingAddress(),
          globalDiscount,
        });
      }).toThrow('Order must have at least one item');
    });

    it('should create an Order with multiple items', () => {
      const cartId = CartId.create();
      const customerId = CustomerId.fromString('customer-123');
      const items = [
        createTestOrderItemLine({
          productId: 'PRODUCT-A-001',
          quantity: 2,
          unitPrice: new Money(50.0, 'USD'),
        }),
        createTestOrderItemLine({
          productId: 'PRODUCT-B-001',
          quantity: 1,
          unitPrice: new Money(30.0, 'USD'),
        }),
        createTestOrderItemLine({
          productId: 'PRODUCT-C-001',
          quantity: 3,
          unitPrice: new Money(20.0, 'USD'),
          itemDiscount: new Money(5.0, 'USD'),
        }),
      ];
      const globalDiscount = new Money(10.0, 'USD');

      const order = Order.create({
        cartId,
        customerId,
        items,
        shippingAddress: createTestShippingAddress(),
        globalDiscount,
      });

      expect(order.items).toHaveLength(3);
      expect(order.items[0].productId.getValue()).toBe('PRODUCT-A-001');
      expect(order.items[1].productId.getValue()).toBe('PRODUCT-B-001');
      expect(order.items[2].productId.getValue()).toBe('PRODUCT-C-001');
    });
  });

  describe('State Machine: markAsPaid', () => {
    it('should transition from AwaitingPayment to Paid with payment ID', () => {
      const order = createTestOrder();

      const paymentId = 'pay_123456789';
      order.markAsPaid(paymentId);

      expect(order.status).toEqual(OrderStatus.asPaid());
      expect(order.paymentId).toBe(paymentId);
    });

    it('should throw error when marking already paid order as paid', () => {
      const order = createTestOrder();

      order.markAsPaid('pay_123');

      expect(() => {
        order.markAsPaid('pay_456');
      }).toThrow('Cannot transition status from paid to paid');
    });
  });

  describe('get totalAmount', () => {
    it('should compute total amount (sum of line totals - globalDiscount)', () => {
      const order = Order.create({
        cartId: CartId.create(),
        customerId: CustomerId.fromString('customer-123'),
        items: [
          createTestOrderItemLine({
            quantity: 2,
            unitPrice: new Money(50.0, 'USD'),
          }),
        ], // Line total: (50.00 * 2) - 0 = 100.00
        shippingAddress: createTestShippingAddress(),
        globalDiscount: new Money(10.0, 'USD'),
      });

      expect(order.totalAmount).toEqual(new Money(90.0, 'USD'));
    });
  });
});
