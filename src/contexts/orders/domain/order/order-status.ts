const ORDER_STATUS = {
  AWAITING_PAYMENT: 'awaiting-payment',
  PAID: 'paid',
} as const;
const VALID_STATUSES = Object.values(ORDER_STATUS);
type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export class OrderStatus {
  readonly status: OrderStatusType;

  private constructor(status: OrderStatusType) {
    this.validateStatus(status);
    this.status = status;
  }

  private validateStatus(status: OrderStatusType) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(
        `Invalid status: ${String(status)}. Must be one of [${VALID_STATUSES.toString()}]`,
      );
    }
  }

  static asAwaitingPayment(): OrderStatus {
    return new OrderStatus(ORDER_STATUS.AWAITING_PAYMENT);
  }

  static asPaid(): OrderStatus {
    return new OrderStatus(ORDER_STATUS.PAID);
  }

  toPaid(): OrderStatus {
    return OrderStatus.asPaid();
  }

  isPaid(): this is { status: typeof ORDER_STATUS.PAID } {
    return this.status === ORDER_STATUS.PAID;
  }

  equals(other: OrderStatus): boolean {
    return this.status === other.status;
  }

  toString(): string {
    return this.status;
  }
}
