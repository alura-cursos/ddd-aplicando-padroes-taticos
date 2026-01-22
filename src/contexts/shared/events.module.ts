import { Global, Module } from '@nestjs/common';
import { InMemoryMessageBus } from './events/in-memory-message-bus';
import { MESSAGE_BUS } from './events/message-bus.interface';

@Global()
@Module({
  providers: [
    {
      provide: MESSAGE_BUS,
      useClass: InMemoryMessageBus,
    },
  ],
  exports: [MESSAGE_BUS],
})
export class EventsModule {}
