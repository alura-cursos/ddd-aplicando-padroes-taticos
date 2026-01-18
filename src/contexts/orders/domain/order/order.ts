import { CustomerId } from '../shared/customer-id';
import { Money } from '../shared/money';
import { CartId } from '../shopping-cart/cart-id';
import { CartItem } from '../shopping-cart/cart-item';
import { OrderId } from './order-id';
import { OrderItem } from './order-item';
import { OrderStatus } from './order-status';
import { ShippingAddress } from './shipping-address';

type OrderParams = {
  orderId: OrderId;
  cartId: CartId;
  customerId: CustomerId;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  globalDiscount: Money;
  status: OrderStatus;
  paymentId: string | null;
};

type CreateOrderParams = {
  cartId: CartId;
  customerId: CustomerId;
  items: { cartItem: CartItem; unitPrice: Money; discount: Money }[];
  shippingAddress: ShippingAddress;
  globalDiscount: Money;
};

/**
 *  Order Aggregate Root
 *  - State transitions: AwaitingPayment → Paid
 *  - Invariants: min 1 item, consistent currencies between items and discounts
 **/
export class Order {
  readonly orderId: OrderId;
  readonly cartId: CartId;
  readonly customerId: CustomerId;
  readonly items: OrderItem[];
  readonly shippingAddress: ShippingAddress;
  globalDiscount: Money;
  status: OrderStatus;
  paymentId: string | null;

  constructor(params: OrderParams) {
    this.orderId = params.orderId;
    this.cartId = params.cartId;
    this.customerId = params.customerId;
    this.items = params.items;
    this.shippingAddress = params.shippingAddress;
    this.status = params.status;
    this.globalDiscount = params.globalDiscount;
    this.paymentId = params.paymentId;
    this.validate();
  }

  static create(params: CreateOrderParams): Order {
    const order = new Order({
      orderId: OrderId.generate(),
      cartId: params.cartId,
      customerId: params.customerId,
      items: params.items.map(({ cartItem, unitPrice, discount }) =>
        OrderItem.create(
          cartItem.getProductId(),
          cartItem.getQuantity(),
          unitPrice,
          discount,
        ),
      ),
      shippingAddress: params.shippingAddress,
      status: OrderStatus.asAwaitingPayment(),
      globalDiscount: params.globalDiscount,
      paymentId: null,
    });

    return order;
  }

  applyGlobalDiscount(globalDiscount: Money): void {
    if (this.status.isPaid()) {
      throw new Error('Cannot apply global discount to paid order');
    }
    this.globalDiscount = globalDiscount;
    this.validate();
  }

  markAsPaid(paymentId: string): void {
    this.checkCanBePaid();
    this.status = this.status.toPaid();
    this.paymentId = paymentId;
  }

  private checkCanBePaid(): void {
    if (this.status.isPaid()) {
      throw new Error(
        `Cannot transition status from ${this.status.toString()} to paid`,
      );
    }
  }

  private validate(): void {
    this.hasAtLeastOneItem();
    this.hasConsistentCurrencies();
  }

  private hasAtLeastOneItem() {
    if (this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
  }

  private hasConsistentCurrencies() {
    const globalDiscountCurrency = this.globalDiscount.currency;
    const allSameCurrency = this.items.every(
      (item) =>
        item.unitPrice.currency === globalDiscountCurrency &&
        item.itemDiscount.currency === globalDiscountCurrency,
    );

    if (!allSameCurrency) {
      throw new Error(
        'All order items and discounts must use the same currency',
      );
    }
  }

  get totalAmount(): Money {
    return this.items
      .reduce(
        (acc, item) => acc.add(item.getLineTotal()),
        new Money(0, this.globalDiscount.currency),
      )
      .subtract(this.globalDiscount);
  }
}
