import { Ticket } from '../../entities/Ticket';

export interface ListTicketsPort {
    execute(): Promise<Ticket[]>;
}
