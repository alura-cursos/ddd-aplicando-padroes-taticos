import { randomUUID } from 'node:crypto';
import { StringId } from './string-id.base';

/**
 * UuidId Base Class
 *
 * Abstract base class for UUID-based identifier value objects.
 * Extends StringId and adds UUID format validation and generation.
 *
 * Subclasses should extend this to create specific UUID-based ID types:
 * - OrderId extends UuidId
 * - CartId extends UuidId
 * - EventId extends UuidId
 *
 * @abstract
 */
export abstract class UuidId extends StringId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  protected constructor(value: string) {
    super(value); // Validates non-empty via StringId
    this.validateUuidFormat(value);
    // Override value with lowercase normalized version
    (this as { value: string }).value = value.toLowerCase();
  }

  static generate<T extends UuidId>(this: new (value: string) => T): T {
    return new this(UuidId.generateUuid());
  }

  protected static generateUuid(): string {
    return randomUUID();
  }

  private validateUuidFormat(value: string): void {
    if (!UuidId.UUID_REGEX.test(value)) {
      throw new Error(`Invalid UUID format for ${this.constructor.name}`);
    }
  }
}
