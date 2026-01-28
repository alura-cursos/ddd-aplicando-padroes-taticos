import { Money } from '../../../shared/value-objects/money';
import { CustomerId } from '../../domain/shared/customer-id';
import { ProductId } from '../../domain/shared/product-id';
import { Quantity } from '../../domain/shared/quantity';
import { CartId } from '../../domain/shopping-cart/cart-id';
import { Order } from '../../domain/order/order';
import { OrderId } from '../../domain/order/order-id';
import { OrderItem } from '../../domain/order/order-item';
import { OrderStatus } from '../../domain/order/order-status';
import { ShippingAddress } from '../../domain/order/shipping-address';

/**
 * Database row types matching our schema
 */
export interface OrderRow {
  order_id: string;
  cart_id: string;
  customer_id: string;
  status: string;
  payment_id: string | null;
  global_discount_amount: string;
  global_discount_currency: string;
  shipping_address_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ShippingAddressRow {
  id: number;
  street: string;
  address_line2: string | null;
  city: string;
  state_or_province: string;
  postal_code: string;
  country: string;
  delivery_instructions: string | null;
}

export interface OrderItemRow {
  id: number;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_amount: string;
  unit_price_currency: string;
  item_discount_amount: string;
  item_discount_currency: string;
}

/**
 * Data Mapper: Translates between Order aggregate and database rows
 *
 * Keeps domain model pure - no database concerns in domain objects
 */
export class OrderMapper {
  /**
   * Convert Order aggregate to database rows
   *
   * Decomposes aggregate into three row types for insertion/update
   */
  static toPersistence(order: Order): {
    orderRow: Omit<OrderRow, 'created_at' | 'updated_at'>;
    addressRow: Omit<ShippingAddressRow, 'id'>;
    itemRows: Omit<OrderItemRow, 'id'>[];
  } {
    const addressRow: Omit<ShippingAddressRow, 'id'> = {
      street: order.shippingAddress.street,
      address_line2: order.shippingAddress.addressLine2 ?? null,
      city: order.shippingAddress.city,
      state_or_province: order.shippingAddress.stateOrProvince,
      postal_code: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      delivery_instructions: order.shippingAddress.deliveryInstructions ?? null,
    };

    const itemRows: Omit<OrderItemRow, 'id'>[] = order.items.map((item) => ({
      order_id: order.orderId.getValue(),
      product_id: item.productId.getValue(),
      quantity: item.quantity.getValue(),
      unit_price_amount: item.unitPrice.amount.toString(),
      unit_price_currency: item.unitPrice.currency,
      item_discount_amount: item.itemDiscount.amount.toString(),
      item_discount_currency: item.itemDiscount.currency,
    }));

    const orderRow: Omit<OrderRow, 'created_at' | 'updated_at'> = {
      order_id: order.orderId.getValue(),
      cart_id: order.cartId.getValue(),
      customer_id: order.customerId.getValue(),
      status: order.status.toString(),
      payment_id: order.paymentId,
      global_discount_amount: order.globalDiscount.amount.toString(),
      global_discount_currency: order.globalDiscount.currency,
      shipping_address_id: 0, // Placeholder - will be set after address insert
    };

    return { orderRow, addressRow, itemRows };
  }

  /**
   * Reconstruct Order aggregate from database rows
   *
   * Uses Order constructor (not factory) to avoid re-triggering domain events
   */
  static toDomain(
    orderRow: OrderRow,
    itemRows: OrderItemRow[],
    addressRow: ShippingAddressRow,
  ): Order {
    const shippingAddress = new ShippingAddress({
      street: addressRow.street,
      addressLine2: addressRow.address_line2 ?? undefined,
      city: addressRow.city,
      stateOrProvince: addressRow.state_or_province,
      postalCode: addressRow.postal_code,
      country: addressRow.country,
      deliveryInstructions: addressRow.delivery_instructions ?? undefined,
    });

    const items = itemRows.map((row) =>
      OrderItem.create(
        ProductId.fromString(row.product_id),
        Quantity.of(row.quantity),
        new Money(parseFloat(row.unit_price_amount), row.unit_price_currency),
        new Money(
          parseFloat(row.item_discount_amount),
          row.item_discount_currency,
        ),
      ),
    );

    // Reconstruct status
    const status =
      orderRow.status === 'paid'
        ? OrderStatus.asPaid()
        : OrderStatus.asAwaitingPayment();

    // Use constructor to avoid re-triggering domain events
    return new Order({
      orderId: OrderId.fromString(orderRow.order_id),
      cartId: CartId.fromString(orderRow.cart_id),
      customerId: CustomerId.fromString(orderRow.customer_id),
      items,
      shippingAddress,
      globalDiscount: new Money(
        parseFloat(orderRow.global_discount_amount),
        orderRow.global_discount_currency,
      ),
      status,
      paymentId: orderRow.payment_id,
    });
  }
}
