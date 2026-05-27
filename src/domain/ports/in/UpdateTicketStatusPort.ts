import { TicketStatus } from '../../entities/Ticket';

export interface UpdateTicketStatusCommand {
    ticketId: string;
    userId: string;
    status: TicketStatus;
}

export interface UpdateTicketStatusPort {
    execute(command: UpdateTicketStatusCommand): Promise<void>;
}
