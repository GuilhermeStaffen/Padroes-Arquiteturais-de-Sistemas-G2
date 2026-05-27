import { Ticket } from '../../entities/Ticket';

export interface CreateTicketCommand {
    title: string;
    description: string;
    userId: string;
}

export interface CreateTicketPort {
    execute(command: CreateTicketCommand): Promise<Ticket>;
}
