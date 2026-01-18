import { Money } from '../../../shared/money';
import { CustomerId } from '../shared/customer-id';
import { ProductId } from '../shared/product-id';
import { Quantity } from '../shared/quantity';

export interface PricingGateway {
  getProductPrice(productId: ProductId): Promise<Money>;

  getProductDiscount(
    productId: ProductId,
    customerId: CustomerId,
    quantity: Quantity,
  ): Promise<Money>;

  getOrderDiscount(customerId: CustomerId, orderTotal: Money): Promise<Money>;
}
