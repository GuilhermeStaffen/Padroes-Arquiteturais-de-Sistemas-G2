import amqp from 'amqplib';
import { DomainEvent } from '../../../../../../domain/ports/out/EventPublisher';

export class DiscordNotificationConsumer {
    private readonly exchangeName = 'ticket_events';
    private readonly queueName = 'discord_notifications_queue';
    private readonly webhookUrl = 'https://discord.com/api/webhooks/1509234995146002525/M7nm-tl4iTN4rkfdXttdySB-UCFB6RMbRkDN1fy5iP1o3Zi0ChFSc2Y7CNYU5K907f18';


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

    private async handleEvent(event: DomainEvent): Promise<void> {
        if (event.eventName === 'TicketCreated') {
            console.log(
                `[Discord Consumer] Processando evento: ${event.eventName}`,
            );

            const message = {
                content:
                    `**Novo Ticket Criado**\n\n` +
                    `Título: ${event.payload.title}\n` +
                    `Descrição: ${event.payload.description}\n` +
                    `Usuário: ${event.payload.username} - ${event.payload.userId}\n` +
                    `Status: ${event.payload.status}\n` +
                    `Data de criação: ${event.payload.createdAt}\n`
            };

            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            console.log(
                '[Discord Consumer] Mensagem enviada para o Discord.',
            );
        }
    }
}
