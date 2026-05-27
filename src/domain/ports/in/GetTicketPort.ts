import { Ticket } from '../../entities/Ticket';

export interface GetTicketPort {
    execute(id: string): Promise<Ticket | null>;
}
