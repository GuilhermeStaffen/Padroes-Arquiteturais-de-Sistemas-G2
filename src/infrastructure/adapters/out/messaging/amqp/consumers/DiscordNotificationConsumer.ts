import amqp from 'amqplib';
import { DomainEvent } from '../../../../../../domain/ports/out/EventPublisher';

export class DiscordNotificationConsumer {
    private readonly exchangeName = 'ticket_events';
    private readonly queueName = 'discord_notifications_queue';

    async start(): Promise<void> {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(rabbitUrl);
        const channel = await connection.createChannel();

        await channel.assertExchange(this.exchangeName, 'fanout', { durable: true });
        
        const q = await channel.assertQueue(this.queueName, { durable: true });
        await channel.bindQueue(q.queue, this.exchangeName, '');

        console.log(`[*] DiscordConsumer escutando mensages em ${q.queue}.`);

        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const event: DomainEvent = JSON.parse(msg.content.toString());
                this.handleEvent(event);
                channel.ack(msg);
            }
        });
    }

    private handleEvent(event: DomainEvent): void {
        if (event.eventName === 'TicketCreated') {
            console.log(`[Discord Consumer] Processando evento: ${event.eventName}`);
            console.log(`[Discord Consumer] Simulando Mensagem para novo TICKET: ${event.payload.title}. User: ${event.payload.userId}`);
        }
    }
}
