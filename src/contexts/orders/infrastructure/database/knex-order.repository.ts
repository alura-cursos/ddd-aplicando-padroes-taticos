import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Order } from '../../domain/order/order';
import { OrderId } from '../../domain/order/order-id';
import { OrderRepository } from '../../domain/order/order.repository';
import { CartId } from '../../domain/shopping-cart/cart-id';
import {
  OrderItemRow,
  OrderMapper,
  OrderRow,
  ShippingAddressRow,
} from './order.mapper';

/**
 * KnexOrderRepository
 *
 * Relational database implementation of OrderRepository using Knex
 *
 * Demonstrates DDD repository pattern with:
 * - Data mapper for domain ↔ database translation
 * - Aggregate persistence (Order + OrderItems + ShippingAddress)
 * - Natural key (domain OrderId as PK)
 *
 * Educational notes:
 * - No explicit transactions (TODO: production would need this)
 * - Basic error handling (TODO: production would need retries, logging)
 * - Synchronous save operations (TODO: consider event-driven patterns)
 */
@Injectable()
export class KnexOrderRepository implements OrderRepository {
  constructor(private readonly knex: Knex) {}

  async save(order: Order): Promise<void> {
    const orderId = order.orderId.getValue();

    // Try to update first - more efficient for existing orders
    const updateResult = await this.knex<OrderRow>('orders')
      .where('order_id', orderId)
      .select('shipping_address_id')
      .first();

    if (updateResult) {
      await this.updateOrder(order, updateResult.shipping_address_id);
    } else {
      await this.insertOrder(order);
    }
  }

  async findById(id: OrderId): Promise<Order | null> {
    return this.findOrderBy('order_id', id.getValue());
  }

  async findByCartId(cartId: CartId): Promise<Order | null> {
    return this.findOrderBy('cart_id', cartId.getValue());
  }

  private async findOrderBy(
    column: 'order_id' | 'cart_id',
    value: string,
  ): Promise<Order | null> {
    const orderRow = await this.knex<OrderRow>('orders')
      .where(column, value)
      .first();

    if (!orderRow) {
      return null;
    }

    return this.hydrateOrder(orderRow);
  }

  private async insertOrderItems(
    itemRows: Omit<OrderItemRow, 'id'>[],
  ): Promise<void> {
    if (itemRows.length > 0) {
      await this.knex<OrderItemRow>('order_items').insert(itemRows);
    }
  }

  /**
   * Helper: Load Order aggregate from database
   *
   * Loads order + items + address and reconstructs domain object
   */
  private async hydrateOrder(orderRow: OrderRow): Promise<Order> {
    // Load shipping address
    const addressRow = await this.knex<ShippingAddressRow>('shipping_addresses')
      .where('id', orderRow.shipping_address_id)
      .first();

    if (!addressRow) {
      throw new Error(
        `Shipping address not found for order ${orderRow.order_id}`,
      );
    }

    // Load order items
    const itemRows = await this.knex<OrderItemRow>('order_items').where(
      'order_id',
      orderRow.order_id,
    );

    // Reconstruct domain object
    return OrderMapper.toDomain(orderRow, itemRows, addressRow);
  }

  /**
   * Insert new order aggregate
   *
   * TODO: Wrap in transaction for atomicity
   */
  private async insertOrder(order: Order): Promise<void> {
    const { orderRow, addressRow, itemRows } = OrderMapper.toPersistence(order);

    // Insert shipping address first (get generated id)
    const [result] = await this.knex<ShippingAddressRow>('shipping_addresses')
      .insert(addressRow)
      .returning('id');

    // Insert order with address FK
    await this.knex<OrderRow>('orders').insert({
      ...orderRow,
      shipping_address_id: result.id,
    });

    // Insert order items
    await this.insertOrderItems(itemRows);
  }

  /**
   * Update existing order aggregate
   *
   * Strategy: Update order row, delete and re-insert items and address
   * TODO: More efficient approach would be to diff and update only changes
   * TODO: Wrap in transaction for atomicity
   */
  private async updateOrder(
    order: Order,
    shippingAddressId: number,
  ): Promise<void> {
    const { orderRow, addressRow, itemRows } = OrderMapper.toPersistence(order);
    const orderId = order.orderId.getValue();

    // Update shipping address
    await this.knex<ShippingAddressRow>('shipping_addresses')
      .where('id', shippingAddressId)
      .update(addressRow);

    // Update order
    await this.knex<OrderRow>('orders')
      .where('order_id', orderId)
      .update({
        ...orderRow,
        shipping_address_id: shippingAddressId,
        updated_at: this.knex.fn.now(),
      });

    // Delete and re-insert items (simple approach)
    await this.knex<OrderItemRow>('order_items')
      .where('order_id', orderId)
      .delete();

    await this.insertOrderItems(itemRows);
  }
}
