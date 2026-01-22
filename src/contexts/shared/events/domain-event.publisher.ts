import { DomainEvent } from './domain-event';

/**
 * Domain Event Publisher
 * Maps domain events to integration messages and publishes to message bus
 * Acts as Anti-Corruption Layer between domain and external contexts
 */

export interface DomainEventPublisher {
  publishDomainEvents(events: DomainEvent[]): Promise<void>;
}

export const DOMAIN_EVENT_PUBLISHER = Symbol('DomainEventPublisher');
