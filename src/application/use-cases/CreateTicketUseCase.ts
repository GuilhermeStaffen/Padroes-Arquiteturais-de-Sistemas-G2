import { v4 as uuidv4 } from 'uuid';
import { Ticket } from '../../domain/entities/Ticket';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { EventPublisher } from '../../domain/ports/out/EventPublisher';
import { CreateTicketPort, CreateTicketCommand } from '../../domain/ports/in/CreateTicketPort';

export class CreateTicketUseCase implements CreateTicketPort {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly eventPublisher: EventPublisher
    ) {}

    public async execute(command: CreateTicketCommand): Promise<Ticket> {
        const ticketId = uuidv4();
        const ticket = new Ticket(
            ticketId,
            command.title,
            command.description,
            command.userId,
            'OPEN',
            new Date()
        );

        await this.ticketRepository.save(ticket);

        await this.eventPublisher.publish({
            eventName: 'TicketCreated',
            payload: {
                ticketId: ticket.id,
                title: ticket.title,
                userId: ticket.userId,
                status: ticket.status
            },
            timestamp: new Date()
        });

        return ticket;
    }
}
