import { CartItem } from '../cart-item';
import { ProductId } from '../value-objects/product-id';
import { Quantity } from '../value-objects/quantity';

describe('CartItem', () => {
  describe('create', () => {
    it('should create CartItem with ProductId and Quantity', () => {
      const productId = ProductId.fromString('product-1');
      const quantity = Quantity.of(3);

      const cartItem = CartItem.create(productId, quantity);

      expect(cartItem.getProductId()).toBe(productId);
      expect(cartItem.getQuantity()).toBe(quantity);
    });
  });

  describe('getProductId', () => {
    it('should return correct ProductId', () => {
      const productId = ProductId.fromString('product-abc');
      const quantity = Quantity.of(5);
      const cartItem = CartItem.create(productId, quantity);

      expect(cartItem.getProductId()).toBe(productId);
      expect(cartItem.getProductId().getValue()).toBe('product-abc');
    });
  });

  describe('getQuantity', () => {
    it('should return correct Quantity', () => {
      const productId = ProductId.fromString('product-1');
      const quantity = Quantity.of(7);
      const cartItem = CartItem.create(productId, quantity);

      expect(cartItem.getQuantity()).toBe(quantity);
      expect(cartItem.getQuantity().getValue()).toBe(7);
    });
  });

  describe('updateQuantity', () => {
    it('should replace quantity with new value', () => {
      const productId = ProductId.fromString('product-1');
      const cartItem = CartItem.create(productId, Quantity.of(3));

      const newQuantity = Quantity.of(8);
      cartItem.updateQuantity(newQuantity);

      expect(cartItem.getQuantity()).toBe(newQuantity);
      expect(cartItem.getQuantity().getValue()).toBe(8);
    });

    it('should allow updating to different valid quantities', () => {
      const productId = ProductId.fromString('product-1');
      const cartItem = CartItem.create(productId, Quantity.of(5));

      cartItem.updateQuantity(Quantity.of(1));
      expect(cartItem.getQuantity().getValue()).toBe(1);

      cartItem.updateQuantity(Quantity.of(10));
      expect(cartItem.getQuantity().getValue()).toBe(10);
    });
  });

  describe('addQuantity', () => {
    it('should add to existing quantity', () => {
      const productId = ProductId.fromString('product-1');
      const cartItem = CartItem.create(productId, Quantity.of(3));

      cartItem.addQuantity(Quantity.of(4));

      expect(cartItem.getQuantity().getValue()).toBe(7);
    });

    it('should allow adding up to maximum', () => {
      const productId = ProductId.fromString('product-1');
      const cartItem = CartItem.create(productId, Quantity.of(6));

      cartItem.addQuantity(Quantity.of(4));

      expect(cartItem.getQuantity().getValue()).toBe(10);
    });

    it('should throw when result exceeds 10', () => {
      const productId = ProductId.fromString('product-1');
      const cartItem = CartItem.create(productId, Quantity.of(7));

      expect(() => cartItem.addQuantity(Quantity.of(4))).toThrow(
        'Quantity must be an integer between 1 and 10',
      );
    });

    it('should not modify quantity when add fails', () => {
      const productId = ProductId.fromString('product-1');
      const cartItem = CartItem.create(productId, Quantity.of(8));

      try {
        cartItem.addQuantity(Quantity.of(5));
      } catch {
        // Expected to throw
      }

      // Original quantity should be unchanged
      expect(cartItem.getQuantity().getValue()).toBe(8);
    });
  });
});
