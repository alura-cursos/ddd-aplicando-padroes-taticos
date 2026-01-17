import { StringId } from './string-id.base';

/**
 * CustomerId Value Object
 * Represents a customer identifier from the Customer Management bounded context.
 */
export class CustomerId extends StringId {
  static fromString(value: string): CustomerId {
    return new CustomerId(value);
  }
}
