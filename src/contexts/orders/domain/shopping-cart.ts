import { CartItem } from './cart-item';
import { CartId } from './value-objects/cart-id';
import { CustomerId } from './value-objects/customer-id';

interface ShoppingCart {
  cartId: CartId;
  customerId: CustomerId;
  status: string;
  items: CartItem[];

  create: () => void;
  addItem: () => void;
  getItem: () => void;
  markAsConverted: () => void;
}
