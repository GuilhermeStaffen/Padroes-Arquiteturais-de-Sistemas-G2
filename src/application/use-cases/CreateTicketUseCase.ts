import { v4 as uuidv4 } from 'uuid';
import { Ticket } from '../../domain/entities/Ticket';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { UserRepository } from '../../domain/ports/out/UserRepository';
import { EventPublisher } from '../../domain/ports/out/EventPublisher';
import { CreateTicketPort, CreateTicketCommand } from '../../domain/ports/in/CreateTicketPort';

export class CreateTicketUseCase implements CreateTicketPort {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher
    ) { }

    public async execute(command: CreateTicketCommand): Promise<Ticket> {

        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new Error('Usuário não autorizado a criar tickets');
        }

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
