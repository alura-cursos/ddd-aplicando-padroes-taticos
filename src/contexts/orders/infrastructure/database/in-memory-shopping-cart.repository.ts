import { Injectable } from '@nestjs/common';
import { ShoppingCart } from '../../domain/shopping-cart';
import { ShoppingCartRepository } from '../../domain/shopping-cart.repository';
import { CartId } from '../../domain/value-objects/cart-id';
import { CustomerId } from '../../domain/value-objects/customer-id';

@Injectable()
export class InMemoryShoppingCartRepository implements ShoppingCartRepository {
  private readonly carts: Map<CartId['value'], ShoppingCart> = new Map();

  async save(cart: ShoppingCart): Promise<void> {
    const cartKey = cart.getCartId().getValue();
    this.carts.set(cartKey, cart);
    return Promise.resolve();
  }

  async findById(cartId: CartId): Promise<ShoppingCart | null> {
    const cartKey = cartId.getValue();
    const cart = this.carts.get(cartKey);
    return Promise.resolve(cart || null);
  }

  async findByCustomerId(customerId: CustomerId): Promise<ShoppingCart[]> {
    const customerKey = customerId.getValue();
    const customerCarts: ShoppingCart[] = [];

    for (const cart of this.carts.values()) {
      if (cart.getCustomerId().getValue() === customerKey) {
        customerCarts.push(cart);
      }
    }

    return Promise.resolve(customerCarts);
  }

  async delete(cartId: CartId): Promise<void> {
    const cartKey = cartId.getValue();
    this.carts.delete(cartKey);
    return Promise.resolve();
  }
}
