import { CartItem, CartItemJSON } from './cart-item';
import { CartId } from './value-objects/cart-id';
import { CartStatus } from './value-objects/cart-status';
import { CustomerId } from './value-objects/customer-id';
import { ProductId } from './value-objects/product-id';
import { Quantity } from './value-objects/quantity';

type ShoppingCartParams = {
  cartId: CartId;
  customerId: CustomerId;
  status: CartStatus;
  items: CartItem[];
};

export class ShoppingCart {
  private cartId: CartId;
  private customerId: CustomerId;
  private status: CartStatus;
  private items: CartItem[];

  constructor(params: ShoppingCartParams) {
    this.cartId = params.cartId;
    this.customerId = params.customerId;
    this.items = params.items;
    this.status = params.status;
    this.validate();
  }

  static create(customerId: CustomerId) {
    return new ShoppingCart({
      cartId: CartId.create(),
      customerId,
      items: [],
      status: CartStatus.asActive(),
    });
  }

  private validate() {
    // Ensure is not empty if converted
    if (this.isEmpty() && this.isConverted()) {
      throw new Error('Cannot restore empty cart with converted status');
    }
  }

  addItem(productId: ProductId, quantity: Quantity) {
    // Ensure cart is not already converted
    if (this.isConverted()) {
      throw new Error(
        `Cart ${this.cartId.getValue()} has already been converted and cannot be modified`,
      );
    }
    // Consolidate existing items
    const existingItem = this.getItem(productId);
    if (existingItem) {
      existingItem.addQuantity(quantity);
    } else {
      const item = CartItem.create(productId, quantity);
      this.items.push(item);
    }
  }

  markAsConverted() {
    // Ensure cart is not empty
    if (this.isEmpty()) {
      throw new Error('Cannot convert empty cart');
    }
    this.status = this.status.toConverted();
  }

  getCartId(): CartId {
    return this.cartId;
  }

  getCustomerId(): CustomerId {
    return this.customerId;
  }

  getStatus(): CartStatus {
    return this.status;
  }

  getItem(productId: ProductId): CartItem | null {
    return (
      this.items.find((item: CartItem) => {
        return item.getProductId().equals(productId);
      }) || null
    );
  }

  getItems(): CartItemJSON[] {
    return this.items.map((item) => item.toJSON());
  }

  getItemCount(): number {
    return this.items.length;
  }

  hasItem(productId: ProductId): boolean {
    return (
      this.items.findIndex((item: CartItem) => {
        return item.getProductId().equals(productId);
      }) !== -1
    );
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  isConverted(): boolean {
    return this.status.isConverted();
  }
}
