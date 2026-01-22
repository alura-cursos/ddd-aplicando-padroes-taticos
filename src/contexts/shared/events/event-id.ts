import { UuidId } from '../value-objects/uuid-id.base';

export class EventId extends UuidId {
  constructor(value: string) {
    super(value);
  }
}
