import { Injectable } from '@nestjs/common';

import { Order } from '../../domain/order/order';
import { OrderId } from '../../domain/order/order-id';
import { OrderRepository } from '../../domain/order/order.repository';
import { CartId } from '../../domain/shopping-cart/cart-id';

/**
 * InMemoryOrderRepository
 *
 * In-memory implementation of OrderRepository for educational purposes
 * Stores orders in a Map keyed by OrderId
 *
 * In production, this would be replaced with:
 * - PostgreSQL/MySQL repository (TypeORM, Prisma, etc.)
 * - MongoDB repository
 * - Any other persistent storage
 */
@Injectable()
export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.orders.set(order.orderId.getValue(), order);
    return Promise.resolve();
  }

  async findById(id: OrderId): Promise<Order | null> {
    const order = this.orders.get(id.getValue());
    return Promise.resolve(order ?? null);
  }

  /**
   * Used to implement idempotent checkout (prevent duplicate orders from same cart)
   */
  async findByCartId(cartId: CartId): Promise<Order | null> {
    for (const order of this.orders.values()) {
      if (order.cartId.equals(cartId)) {
        return Promise.resolve(order);
      }
    }
    return Promise.resolve(null);
  }

  clear(): void {
    this.orders.clear();
  }

  findAll(): Order[] {
    return Array.from(this.orders.values());
  }
}
