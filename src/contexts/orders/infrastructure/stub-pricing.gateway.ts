import { Injectable } from '@nestjs/common';
import { Money } from '../../shared/money';
import { PricingGateway } from '../domain/order/pricing.gateway';
import { CustomerId } from '../domain/shared/customer-id';
import { ProductId } from '../domain/shared/product-id';
import { Quantity } from '../domain/shared/quantity';

/**
 * StubPricingGateway
 *
 * Stubbed implementation of PricingGateway for testing and demonstration
 * Simulates external Pricing context with hardcoded pricing rules
 *
 * Pricing logic:
 * - Base unit prices per product
 * - 10% discount on items with quantity >= 3
 * - $10 order-level discount if order total > $100
 *
 * In production, this would be replaced with:
 * - HTTP REST client calling Pricing microservice
 * - Complex pricing engine with promotions, coupons, customer segments
 */
@Injectable()
export class StubPricingGateway implements PricingGateway {
  private readonly unitPrices = new Map<string, number>([
    // Generic test products
    ['product-123', 10.0],
    ['product-456', 20.0],
    // Demo products
    ['COFFEE-COL-001', 24.99],
    ['TEA-EARL-001', 12.99],
    ['MUG-CERAMIC-001', 15.99],
    ['GRINDER-BURR-001', 89.99],
  ]);

  private readonly currency = 'USD';

  async getProductPrice(productId: ProductId): Promise<Money> {
    // Simulate network latency
    await this.delay(50);

    const unitPriceAmount = this.unitPrices.get(productId.getValue());
    if (unitPriceAmount === undefined) {
      throw new Error(
        `Failed to get product price: No price found for product ${productId.getValue()}`,
      );
    }

    return new Money(unitPriceAmount, this.currency);
  }

  async getProductDiscount(
    productId: ProductId,
    _customerId: CustomerId,
    quantity: Quantity,
  ): Promise<Money> {
    // Simulate network latency
    await this.delay(50);

    const unitPriceAmount = this.unitPrices.get(productId.getValue());
    if (unitPriceAmount === undefined) {
      throw new Error(
        `Failed to calculate discount: No price found for product ${productId.getValue()}`,
      );
    }

    // Apply item-level discount: 10% off total if quantity >= 3
    const quantityValue = quantity.getValue();
    let discountAmount = 0;
    if (quantityValue >= 3) {
      discountAmount = unitPriceAmount * quantityValue * 0.1;
    }

    return new Money(discountAmount, this.currency);
  }

  async getOrderDiscount(
    _customerId: CustomerId,
    orderTotal: Money,
  ): Promise<Money> {
    // Simulate network latency
    await this.delay(50);

    // Apply order-level discount: $10 off if order total > $100
    let discountAmount = 0;
    if (orderTotal.amount > 100) {
      discountAmount = 10.0;
    }

    return new Money(discountAmount, this.currency);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
