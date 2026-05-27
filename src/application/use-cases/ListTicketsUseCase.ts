import { ListTicketsPort } from '../../domain/ports/in/ListTicketsPort';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { Ticket } from '../../domain/entities/Ticket';

export class ListTicketsUseCase implements ListTicketsPort {
    constructor(private readonly ticketRepository: TicketRepository) {}

    async execute(): Promise<Ticket[]> {
        return this.ticketRepository.findAll();
    }
}
