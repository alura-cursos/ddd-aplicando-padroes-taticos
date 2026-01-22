import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { parseError } from '../errors';
import { IntegrationMessage, MessageBus } from './message-bus.interface';

type MessageHandler<T = any> = (
  message: IntegrationMessage<T>,
) => Promise<void>;

/**
 * Simple topic-based pub/sub
 * Uses Map for topic routing and setTimeout for async delivery
 */
@Injectable()
export class InMemoryMessageBus implements MessageBus {
  private readonly logger = new Logger(InMemoryMessageBus.name);
  private readonly subscribers = new Map<string, Set<MessageHandler>>();

  publish<T>(topic: string, payload: T): Promise<void> {
    const handlers = this.subscribers.get(topic);

    if (!handlers || handlers.size === 0) {
      this.logger.debug(`No subscribers for topic '${topic}', message dropped`);
      return Promise.resolve();
    }

    const message = this.createEnvelope(topic, payload);
    this.logger.log(
      `Publishing message ${message.messageId} to topic '${topic}' (${handlers.size} subscriber(s))`,
    );

    handlers.forEach((handler) => {
      Promise.resolve()
        .then(() => handler(message))
        .catch((error) => {
          const { stack } = parseError(error);
          this.logger.error(
            `Error in handler for topic '${topic}' message ${message.messageId}:`,
            stack,
          );
        });
    });

    return Promise.resolve();
  }

  private createEnvelope<T>(topic: string, payload: T): IntegrationMessage<T> {
    return {
      messageId: randomUUID(),
      topic,
      timestamp: new Date(),
      payload,
    };
  }

  subscribe<T>(
    topic: string,
    handler: (message: IntegrationMessage<T>) => Promise<void>,
  ): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(handler as MessageHandler);
    this.logger.log(
      `Subscriber registered for topic '${topic}' (${this.subscribers.get(topic)!.size} total)`,
    );
  }
}
