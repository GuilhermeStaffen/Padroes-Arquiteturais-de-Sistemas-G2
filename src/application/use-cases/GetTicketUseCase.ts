import { GetTicketPort } from '../../domain/ports/in/GetTicketPort';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { UserRepository } from '../../domain/ports/out/UserRepository';
import { Ticket } from '../../domain/entities/Ticket';

export class GetTicketUseCase implements GetTicketPort {
    constructor(private readonly ticketRepository: TicketRepository, private readonly userRepository: UserRepository) {}

    async execute(id: string, userId: string): Promise<Ticket | null> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.ticketRepository.findById(id);
    }
}
