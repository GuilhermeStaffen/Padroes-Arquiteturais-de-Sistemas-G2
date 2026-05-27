import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { UserRepository } from '../../domain/ports/out/UserRepository';
import { EventPublisher } from '../../domain/ports/out/EventPublisher';
import { UpdateTicketStatusPort, UpdateTicketStatusCommand } from '../../domain/ports/in/UpdateTicketStatusPort';

export class UpdateTicketStatusUseCase implements UpdateTicketStatusPort {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher
    ) {}

    public async execute(command: UpdateTicketStatusCommand): Promise<void> {

        const user = await this.userRepository.findById(command.userId);
        if (!user || !user.isAdmin) {
            throw new Error('Usuário não autorizado a atualizar o status do ticket');
        }

        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.updateStatus(command.status);
        await this.ticketRepository.updateStatus(ticket.id, ticket.status);

        await this.eventPublisher.publish({
            eventName: 'TicketStatusUpdated',
            payload: {
                ticketId: ticket.id,
                oldStatus: ticket.status,
                newStatus: command.status
            },
            timestamp: new Date()
        });
    }
}
