import { CartItem } from '../cart-item';
import { ShoppingCart } from '../shopping-cart';
import { CartId } from '../value-objects/cart-id';
import { CartStatus } from '../value-objects/cart-status';
import { CustomerId } from '../value-objects/customer-id';
import { ProductId } from '../value-objects/product-id';
import { Quantity } from '../value-objects/quantity';

describe('ShoppingCart', () => {
  describe('create', () => {
    it('should create empty active cart', () => {
      const customerId = CustomerId.fromString('customer-1');

      const cart = ShoppingCart.create(customerId);

      expect(cart.getCartId()).toBeInstanceOf(CartId);
      expect(cart.getCustomerId()).toBe(customerId);
      expect(cart.isConverted()).toBe(false);
      expect(cart.getItemCount()).toBe(0);
    });
  });

  describe('constructor', () => {
    it('should restore cart with items and active status', () => {
      const cartId = CartId.create();
      const customerId = CustomerId.fromString('customer-1');
      const items = [
        CartItem.create(ProductId.fromString('product-1'), Quantity.of(5)),
      ];

      const cart = new ShoppingCart({
        cartId,
        customerId,
        items,
        status: CartStatus.asActive(),
      });

      expect(cart.getCartId()).toBe(cartId);
      expect(cart.getCustomerId()).toBe(customerId);
      expect(cart.getItemCount()).toBe(1);
      expect(cart.isConverted()).toBe(false);
    });

    it('should restore cart with converted status', () => {
      const cart = new ShoppingCart({
        cartId: CartId.create(),
        customerId: CustomerId.fromString('customer-1'),
        items: [
          CartItem.create(ProductId.fromString('product-1'), Quantity.of(3)),
        ],
        status: CartStatus.asConverted(),
      });

      expect(cart.isConverted()).toBe(true);
      expect(cart.getItemCount()).toBe(1);
    });

    it('should restore empty active cart', () => {
      const cart = new ShoppingCart({
        cartId: CartId.create(),
        customerId: CustomerId.fromString('customer-1'),
        items: [],
        status: CartStatus.asActive(),
      });

      expect(cart.getItemCount()).toBe(0);
      expect(cart.isConverted()).toBe(false);
    });

    it('should reject restoring empty cart with converted status', () => {
      expect(
        () =>
          new ShoppingCart({
            cartId: CartId.create(),
            customerId: CustomerId.fromString('customer-1'),
            items: [],
            status: CartStatus.asConverted(),
          }),
      ).toThrow('Cannot restore empty cart with converted status');
    });

    describe('addItem', () => {
      it('should add new product to empty cart', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));
        const productId = ProductId.fromString('product-1');
        const quantity = Quantity.of(3);

        cart.addItem(productId, quantity);

        const items = cart.getItems();
        expect(items).toHaveLength(1);
        expect(items[0].productId).toEqual(productId.getValue());
        expect(items[0].quantity).toBe(quantity.getValue());
        expect(cart.getItemCount()).toBe(1);
      });

      it('should consolidate quantity for duplicate product', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));
        const productId = ProductId.fromString('product-1');

        cart.addItem(productId, Quantity.of(3));
        cart.addItem(productId, Quantity.of(4));

        const items = cart.getItems();
        expect(items).toHaveLength(1);
        expect(items[0].quantity).toBe(7);
      });

      it('should create separate line for different product', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));
        const product1 = ProductId.fromString('product-1');
        const product2 = ProductId.fromString('product-2');

        cart.addItem(product1, Quantity.of(3));
        cart.addItem(product2, Quantity.of(5));

        expect(cart.getItems()).toHaveLength(2);
        expect(cart.getItemCount()).toBe(2);
      });

      it('should throw when consolidation exceeds 10', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));
        const productId = ProductId.fromString('product-1');

        cart.addItem(productId, Quantity.of(7));

        // Attempt to add more, which would exceed 10
        expect(() => cart.addItem(productId, Quantity.of(4))).toThrow(
          'Quantity must be an integer between 1 and 10',
        );
      });

      it('should reject addItem after conversion', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));
        cart.addItem(ProductId.fromString('product-1'), Quantity.of(3));

        cart.markAsConverted();

        expect(() =>
          cart.addItem(ProductId.fromString('product-2'), Quantity.of(5)),
        ).toThrow('has already been converted and cannot be modified');
      });
    });

    describe('getItems', () => {
      it('should return defensive copy as array', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));
        cart.addItem(ProductId.fromString('product-1'), Quantity.of(3));

        const items1 = cart.getItems();
        const items2 = cart.getItems();

        // Should be different array instances (defensive copy)
        expect(items1).not.toBe(items2);
        expect(items1).toHaveLength(1);
        expect(items2).toHaveLength(1);
      });
    });

    describe('getItemCount', () => {
      it('should return correct count', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));

        expect(cart.getItemCount()).toBe(0);

        cart.addItem(ProductId.fromString('product-1'), Quantity.of(3));
        expect(cart.getItemCount()).toBe(1);

        cart.addItem(ProductId.fromString('product-2'), Quantity.of(5));
        expect(cart.getItemCount()).toBe(2);

        // Adding duplicate doesn't increase count
        cart.addItem(ProductId.fromString('product-1'), Quantity.of(2));
        expect(cart.getItemCount()).toBe(2);
      });
    });

    describe('markAsConverted', () => {
      it('should mark cart as converted', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));
        cart.addItem(ProductId.fromString('product-1'), Quantity.of(3));

        expect(cart.isConverted()).toBe(false);

        cart.markAsConverted();

        expect(cart.isConverted()).toBe(true);
      });

      it('should reject converting empty cart', () => {
        const cart = ShoppingCart.create(CustomerId.fromString('customer-1'));

        expect(cart.getItemCount()).toBe(0);

        expect(() => cart.markAsConverted()).toThrow(
          'Cannot convert empty cart',
        );
        expect(cart.isConverted()).toBe(false);
      });
    });
  });
});
