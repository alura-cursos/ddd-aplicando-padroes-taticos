import { Money } from '../../../shared/money';
import { ShoppingCart } from '../shopping-cart/shopping-cart';
import { Order } from './order';
import { PricingGateway } from './pricing.gateway';
import { ShippingAddress } from './shipping-address';

/**
 * Domain service responsible for the business logic of creating orders from shopping carts.
 * Encapsulates the domain rules for order creation.
 *
 * Domain Rules:
 * - Cart must not be empty nor previously converted
 * - Order inherits cart's customer and items
 * - Applies current pricing and discount for each item
 * - Applies any global discounts to the order
 */
export class CheckoutService {
  constructor(private readonly pricingGateway: PricingGateway) {}

  async createOrderFromCart(
    cart: ShoppingCart,
    shippingAddress: ShippingAddress,
  ): Promise<Order> {
    if (cart.isEmpty()) {
      throw new Error('Cannot convert an empty cart to an order');
    }
    if (cart.isConverted()) {
      throw new Error(
        'Cannot convert a cart that has already been converted to an order',
      );
    }

    const items = await Promise.all(
      cart.getItems().map(async (cartItem) => {
        const unitPrice = await this.pricingGateway.getProductPrice(
          cartItem.getProductId(),
        );
        const discount = await this.pricingGateway.getProductDiscount(
          cartItem.getProductId(),
          cart.getCustomerId(),
          cartItem.getQuantity(),
        );
        return { cartItem, unitPrice, discount };
      }),
    );

    const order = Order.create({
      cartId: cart.getCartId(),
      customerId: cart.getCustomerId(),
      items,
      shippingAddress,
      globalDiscount: new Money(0, items[0].unitPrice.currency),
    });

    const orderTotal = order.totalAmount;
    const globalDiscount = await this.pricingGateway.getOrderDiscount(
      cart.getCustomerId(),
      orderTotal,
    );

    order.applyGlobalDiscount(globalDiscount);

    return order;
  }
}
