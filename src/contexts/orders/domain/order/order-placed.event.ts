import { DomainEvent } from '../../../shared/events/domain-event';
import { EventId } from '../../../shared/events/event-id';
import { Money } from '../../../shared/value-objects/money';
import { CustomerId } from '../shared/customer-id';
import { CartId } from '../shopping-cart/cart-id';
import { OrderId } from './order-id';
import { OrderItem } from './order-item';
import { ShippingAddress } from './shipping-address';

/**
 * Domain Event: OrderPlaced
 * Emitted when an order is successfully created after checkout
 */
export class OrderPlaced implements DomainEvent {
  public readonly aggregateId: string;
  public readonly occurredAt: Date;
  public readonly eventId: EventId;

  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly cartId: CartId,
    public readonly items: readonly OrderItem[],
    public readonly totalAmount: Money,
    public readonly shippingAddress: ShippingAddress,
  ) {
    this.eventId = EventId.generate();
    this.aggregateId = orderId.getValue();
    this.occurredAt = new Date();
  }
}
