/**
 * Base interface for all domain events
 *
 * Domain events represent significant business moments that have occurred
 * in the domain. They are named in past tense (e.g., OrderPaid, OrderCancelled)
 * and include all data that subscribers need to react to the event.
 *
 * All domain events must include:
 * - aggregateId: The ID of the aggregate that raised the event
 * - occurredAt: Timestamp when the event occurred
 */
export interface DomainEvent {
  readonly aggregateId: string;
  readonly occurredAt: Date;
}
