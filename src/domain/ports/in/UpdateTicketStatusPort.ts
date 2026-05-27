import { TicketStatus } from '../../entities/Ticket';

export interface UpdateTicketStatusCommand {
    ticketId: string;
    status: TicketStatus;
}

export interface UpdateTicketStatusPort {
    execute(command: UpdateTicketStatusCommand): Promise<void>;
}
