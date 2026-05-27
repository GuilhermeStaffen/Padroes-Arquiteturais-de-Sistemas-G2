import { ListTicketsPort } from '../../domain/ports/in/ListTicketsPort';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { UserRepository } from '../../domain/ports/out/UserRepository';
import { Ticket } from '../../domain/entities/Ticket';

export class ListTicketsUseCase implements ListTicketsPort {
    constructor(private readonly ticketRepository: TicketRepository, private readonly userRepository: UserRepository) {}

    async execute(userId: string): Promise<Ticket[]> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.ticketRepository.findAll();
    }
}
