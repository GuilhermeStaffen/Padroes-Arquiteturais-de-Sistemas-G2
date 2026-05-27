import { Ticket, Comment, TicketStatus } from '../../entities/Ticket';

export interface TicketRepository {
    save(ticket: Ticket): Promise<void>;
    findById(id: string): Promise<Ticket | null>;
    findAll(): Promise<Ticket[]>;
    saveComment(comment: Comment): Promise<void>;
    updateStatus(id: string, status: TicketStatus): Promise<void>;
}
