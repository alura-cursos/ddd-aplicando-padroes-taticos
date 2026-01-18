import { CartId } from '../shopping-cart/cart-id';
import { Order } from './order';
import { OrderId } from './order-id';

export interface OrderRepository {
  save(order: Order): Promise<void>;

  findById(id: OrderId): Promise<Order | null>;

  findByCartId(cartId: CartId): Promise<Order | null>;
}
