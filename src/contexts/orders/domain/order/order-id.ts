import { UuidId } from '../shared/uuid-id.base';

export class OrderId extends UuidId {
  constructor(value: string) {
    super(value);
  }

  static create() {
    return super.generate.call(this) as OrderId;
  }

  static fromString(value: string): OrderId {
    return new OrderId(value);
  }
}
