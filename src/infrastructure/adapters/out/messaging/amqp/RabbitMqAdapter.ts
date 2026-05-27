import * as amqp from 'amqplib';
import { EventPublisher, DomainEvent } from '../../../../../domain/ports/out/EventPublisher';

export class RabbitMqAdapter implements EventPublisher {
    private connection: any = null;
    private channel: any = null;
    private readonly exchangeName = 'ticket_events';

    async connect(): Promise<void> {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        this.connection = await amqp.connect(rabbitUrl);
        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchangeName, 'fanout', { durable: true });
    }

    async publish(event: DomainEvent): Promise<void> {
        if (!this.channel) {
            await this.connect();
        }
        
        const message = Buffer.from(JSON.stringify(event));
        this.channel!.publish(this.exchangeName, '', message, {
            persistent: true
        });
        
        console.log(`[x] Publicado evento ${event.eventName}`, event.payload);
    }
}
