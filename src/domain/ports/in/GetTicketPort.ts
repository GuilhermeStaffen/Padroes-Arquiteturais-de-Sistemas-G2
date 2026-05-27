import { Ticket } from '../../entities/Ticket';

export interface GetTicketPort {
    execute(id: string, userId: string): Promise<Ticket | null>;
}
