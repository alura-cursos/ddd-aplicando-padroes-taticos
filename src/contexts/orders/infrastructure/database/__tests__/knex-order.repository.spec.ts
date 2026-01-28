import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import Knex from 'knex';
import { Money } from '../../../../shared/value-objects/money';
import { Order } from '../../../domain/order/order';
import { OrderId } from '../../../domain/order/order-id';
import { ShippingAddress } from '../../../domain/order/shipping-address';
import { CustomerId } from '../../../domain/shared/customer-id';
import { ProductId } from '../../../domain/shared/product-id';
import { Quantity } from '../../../domain/shared/quantity';
import { CartId } from '../../../domain/shopping-cart/cart-id';
import { CartItem } from '../../../domain/shopping-cart/cart-item';
import { KnexOrderRepository } from '../knex-order.repository';

describe('KnexOrderRepository Integration Tests', () => {
  let container: StartedPostgreSqlContainer;
  let knex: Knex.Knex;
  let repository: KnexOrderRepository;

  // Test helpers
  const expectOrderToMatch = (actual: Order | null, expected: Order): void => {
    expect(actual).not.toBeNull();
    if (!actual) return;

    expect(actual.orderId.equals(expected.orderId)).toBe(true);
    expect(actual.cartId.equals(expected.cartId)).toBe(true);
    expect(actual.customerId.equals(expected.customerId)).toBe(true);
    expect(actual.status.equals(expected.status)).toBe(true);
    expect(actual.shippingAddress.street).toBe(expected.shippingAddress.street);
    expect(actual.shippingAddress.city).toBe(expected.shippingAddress.city);
    expect(actual.globalDiscount.equals(expected.globalDiscount)).toBe(true);
  };

  const expectOrderItem = (
    actual: Order,
    index: number,
    expectedProductId: string,
    expectedQuantity: number,
    expectedUnitPrice: Money,
    expectedDiscount?: Money,
  ) => {
    expect(actual.items[index].productId.getValue()).toBe(expectedProductId);
    expect(actual.items[index].quantity.getValue()).toBe(expectedQuantity);
    expect(actual.items[index].unitPrice.equals(expectedUnitPrice)).toBe(true);
    if (expectedDiscount) {
      expect(actual.items[index].itemDiscount.equals(expectedDiscount)).toBe(
        true,
      );
    }
  };

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

  const createTestOrder = (overrides?: {
    cartId?: CartId;
    customerId?: CustomerId;
    items?: Array<{
      cartItem: CartItem;
      unitPrice: Money;
      discount: Money;
    }>;
    shippingAddress?: ShippingAddress;
    globalDiscount?: Money;
  }) =>
    Order.create({
      cartId: overrides?.cartId ?? CartId.create(),
      customerId:
        overrides?.customerId ?? CustomerId.fromString('customer-123'),
      items: overrides?.items ?? [createTestOrderItemLine()],
      shippingAddress:
        overrides?.shippingAddress ?? createTestShippingAddress(),
      globalDiscount: overrides?.globalDiscount ?? new Money(0, 'USD'),
    });

  beforeAll(async () => {
    // Start PostgreSQL container
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withExposedPorts(5432)
      .start();

    // Create Knex instance with connection pool
    knex = Knex({
      client: 'pg',
      connection: {
        host: container.getHost(),
        port: container.getPort(),
        user: container.getUsername(),
        password: container.getPassword(),
        database: container.getDatabase(),
      },
      migrations: {
        directory: __dirname + '/../migrations',
      },
    });

    // Run migrations
    await knex.migrate.latest();

    // Create repository
    repository = new KnexOrderRepository(knex);
  }, 60000); // 60s timeout for container startup

  afterAll(async () => {
    if (knex) {
      await knex.destroy();
    }
    if (container) {
      await container.stop();
    }
  }, 30000);

  afterEach(async () => {
    // Clean up data between tests - order matters due to FK constraints
    if (knex) {
      await knex('order_items').delete();
      await knex('orders').delete();
      await knex('shipping_addresses').delete();
    }
  });

  describe('save() and findById()', () => {
    it('should persist new order and retrieve it by id', async () => {
      const order = createTestOrder();
      const orderId = order.orderId;

      await repository.save(order);

      const retrieved = await repository.findById(orderId);

      expectOrderToMatch(retrieved, order);
      expect(retrieved!.items).toHaveLength(1);
      expectOrderItem(
        retrieved!,
        0,
        'TEST-SKU-001',
        1,
        new Money(100.0, 'USD'),
      );
    });

    it('should update existing order when saved again', async () => {
      const order = createTestOrder();
      await repository.save(order);

      order.markAsPaid('payment-123');

      await repository.save(order);

      const retrieved = await repository.findById(order.orderId);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.status.isPaid()).toBe(true);
      expect(retrieved!.paymentId).toBe('payment-123');

      const allOrders = await knex('orders').where(
        'order_id',
        order.orderId.getValue(),
      );
      expect(allOrders).toHaveLength(1);
    });

    it('should return null when order does not exist', async () => {
      const nonExistentId = OrderId.generate();
      const result = await repository.findById(nonExistentId);
      expect(result).toBeNull();
    });

    it('should persist order with multiple items', async () => {
      const order = createTestOrder({
        customerId: CustomerId.fromString('customer-456'),
        items: [
          createTestOrderItemLine({
            productId: 'PRODUCT-A',
            quantity: 2,
            unitPrice: new Money(50.0, 'USD'),
          }),
          createTestOrderItemLine({
            productId: 'PRODUCT-B',
            quantity: 1,
            unitPrice: new Money(30.0, 'USD'),
          }),
          createTestOrderItemLine({
            productId: 'PRODUCT-C',
            quantity: 3,
            unitPrice: new Money(20.0, 'USD'),
            itemDiscount: new Money(5.0, 'USD'),
          }),
        ],
        globalDiscount: new Money(10.0, 'USD'),
      });

      await repository.save(order);

      const retrieved = await repository.findById(order.orderId);

      expectOrderToMatch(retrieved, order);
      expect(retrieved!.items).toHaveLength(3);
      expectOrderItem(retrieved!, 0, 'PRODUCT-A', 2, new Money(50.0, 'USD'));
      expectOrderItem(retrieved!, 1, 'PRODUCT-B', 1, new Money(30.0, 'USD'));
      expectOrderItem(
        retrieved!,
        2,
        'PRODUCT-C',
        3,
        new Money(20.0, 'USD'),
        new Money(5.0, 'USD'),
      );
    });
  });

  describe('findByCartId()', () => {
    it('should find order by cart id', async () => {
      const order = createTestOrder();
      await repository.save(order);

      const retrieved = await repository.findByCartId(order.cartId);

      expectOrderToMatch(retrieved, order);
    });

    it('should return null when no order for cart id', async () => {
      const nonExistentCartId = CartId.create();
      const result = await repository.findByCartId(nonExistentCartId);
      expect(result).toBeNull();
    });
  });
});
