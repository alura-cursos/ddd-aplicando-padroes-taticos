import { CustomerId } from '../shared/customer-id';
import { Money } from '../shared/money';
import { ProductId } from '../shared/product-id';
import { Quantity } from '../shared/quantity';

export interface PricingGateway {
  getProductPrice(productId: ProductId): Money;

  getProductDiscount(
    productId: ProductId,
    customerId: CustomerId,
    quantity: Quantity,
  ): Money;

  getOrderDiscount(customerId: CustomerId, orderTotal: Money): Money;
}
