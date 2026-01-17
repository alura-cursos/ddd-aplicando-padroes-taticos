import { ProductId } from './value-objects/product-id';
import { Quantity } from './value-objects/quantity';

export interface CartItemJSON {
  productId: string;
  quantity: number;
}

export class CartItem {
  private readonly productId: ProductId;
  private quantity: Quantity;

  private constructor(productId: ProductId, quantity: Quantity) {
    this.productId = productId;
    this.quantity = quantity;
  }

  static create(productId: ProductId, quantity: Quantity) {
    return new CartItem(productId, quantity);
  }

  getProductId(): ProductId {
    return this.productId;
  }

  getQuantity(): Quantity {
    return this.quantity;
  }

  updateQuantity(newQuantity: Quantity): void {
    this.quantity = newQuantity;
  }

  addQuantity(additionalQuantity: Quantity): void {
    this.quantity = this.quantity.add(additionalQuantity);
  }

  toJSON(): CartItemJSON {
    return {
      productId: this.productId.getValue(),
      quantity: this.quantity.getValue(),
    };
  }
}
