import { Ticket } from '../../entities/Ticket';

export interface ListTicketsPort {
    execute(userId: string): Promise<Ticket[]>;
}
