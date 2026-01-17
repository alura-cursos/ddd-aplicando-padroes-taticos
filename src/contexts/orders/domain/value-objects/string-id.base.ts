/**
 * StringId Base Class
 *
 * Abstract base class for string-based identifier value objects.
 * Provides common validation, equality, and accessor methods.
 *
 * Subclasses should extend this to create specific ID types:
 * - ProductId extends StringId
 * - CustomerId extends StringId
 *
 * @abstract
 */
export abstract class StringId {
  public readonly value: string;

  protected constructor(value: string) {
    this.validateNonEmpty(value);
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: StringId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private validateNonEmpty(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('ID cannot be empty');
    }
  }
}
