import { GetTicketPort } from '../../domain/ports/in/GetTicketPort';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { Ticket } from '../../domain/entities/Ticket';

export class GetTicketUseCase implements GetTicketPort {
    constructor(private readonly ticketRepository: TicketRepository) {}

    async execute(id: string): Promise<Ticket | null> {
        return this.ticketRepository.findById(id);
    }
}
