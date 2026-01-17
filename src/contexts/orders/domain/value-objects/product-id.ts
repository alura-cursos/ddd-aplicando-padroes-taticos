import { StringId } from './string-id.base';

/**
 * ProductId Value Object
 * Represents a product identifier from the Catalog bounded context.
 * Accepts any non-empty string as a valid product ID.
 */
export class ProductId extends StringId {
  static fromString(value: string): ProductId {
    return new ProductId(value);
  }
}
