import { ShoppingCart } from './shopping-cart';
import { CartId } from './value-objects/cart-id';
import { CustomerId } from './value-objects/customer-id';

export interface ShoppingCartRepository {
  save(cart: ShoppingCart): Promise<void>;

  findById(cartId: CartId): Promise<ShoppingCart | null>;

  findByCustomerId(customerId: CustomerId): Promise<ShoppingCart[]>;

  delete(cartId: CartId): Promise<void>;
}
