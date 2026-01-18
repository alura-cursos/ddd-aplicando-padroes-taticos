export interface ShippingAddressProps {
  street: string;
  addressLine2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  deliveryInstructions?: string;
}

export class ShippingAddress {
  public readonly street: string;
  public readonly addressLine2?: string;
  public readonly city: string;
  public readonly stateOrProvince: string;
  public readonly postalCode: string;
  public readonly country: string;
  public readonly deliveryInstructions?: string;

  constructor(props: ShippingAddressProps) {
    this.validateStreet(props.street);
    this.validateCity(props.city);
    this.validateStateOrProvince(props.stateOrProvince);
    this.validatePostalCode(props.postalCode);
    this.validateCountry(props.country);

    this.street = props.street.trim();
    this.city = props.city.trim();
    this.stateOrProvince = props.stateOrProvince.trim();
    this.postalCode = props.postalCode.trim();
    this.country = props.country.trim();

    if (props.addressLine2) {
      this.validateAddressLine2(props.addressLine2);
      const trimmed = props.addressLine2.trim();
      this.addressLine2 = trimmed.length > 0 ? trimmed : undefined;
    }

    if (props.deliveryInstructions) {
      this.validateDeliveryInstructions(props.deliveryInstructions);
      const trimmed = props.deliveryInstructions.trim();
      this.deliveryInstructions = trimmed.length > 0 ? trimmed : undefined;
    }
  }

  private validateStreet(street: string): void {
    const trimmed = street.trim();
    if (trimmed.length === 0) {
      throw new Error('Street cannot be empty');
    }
    if (trimmed.length > 200) {
      throw new Error('Street cannot exceed 200 characters');
    }
  }

  private validateAddressLine2(addressLine2: string): void {
    if (addressLine2.trim().length > 200) {
      throw new Error('Address line 2 cannot exceed 200 characters');
    }
  }

  private validateCity(city: string): void {
    const trimmed = city.trim();
    if (trimmed.length === 0) {
      throw new Error('City cannot be empty');
    }
    if (trimmed.length > 100) {
      throw new Error('City cannot exceed 100 characters');
    }
  }

  private validateStateOrProvince(stateOrProvince: string): void {
    const trimmed = stateOrProvince.trim();
    if (trimmed.length === 0) {
      throw new Error('State or province cannot be empty');
    }
    if (trimmed.length > 100) {
      throw new Error('State or province cannot exceed 100 characters');
    }
  }

  private validatePostalCode(postalCode: string): void {
    const trimmed = postalCode.trim();
    if (trimmed.length === 0) {
      throw new Error('Postal code cannot be empty');
    }
    if (trimmed.length > 20) {
      throw new Error('Postal code cannot exceed 20 characters');
    }
  }

  private validateCountry(country: string): void {
    const trimmed = country.trim();
    if (trimmed.length === 0) {
      throw new Error('Country cannot be empty');
    }
    if (trimmed.length < 2) {
      throw new Error('Country must be at least 2 characters');
    }
    if (trimmed.length > 100) {
      throw new Error('Country cannot exceed 100 characters');
    }
  }

  private validateDeliveryInstructions(instructions: string): void {
    if (instructions.trim().length > 500) {
      throw new Error('Delivery instructions cannot exceed 500 characters');
    }
  }

  equals(other: ShippingAddress): boolean {
    return (
      this.street === other.street &&
      this.addressLine2 === other.addressLine2 &&
      this.city === other.city &&
      this.stateOrProvince === other.stateOrProvince &&
      this.postalCode === other.postalCode &&
      this.country === other.country &&
      this.deliveryInstructions === other.deliveryInstructions
    );
  }

  toString(): string {
    const parts = [this.street];

    if (this.addressLine2) {
      parts.push(this.addressLine2);
    }

    parts.push(`${this.city}, ${this.stateOrProvince} ${this.postalCode}`);
    parts.push(this.country);

    return parts.join(', ');
  }

  toFullString(): string {
    const lines = [this.street];

    if (this.addressLine2) {
      lines.push(this.addressLine2);
    }

    lines.push(`${this.city}, ${this.stateOrProvince} ${this.postalCode}`);
    lines.push(this.country);

    if (this.deliveryInstructions) {
      lines.push(`Delivery: ${this.deliveryInstructions}`);
    }

    return lines.join('\n');
  }
}
