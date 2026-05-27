import { Ticket, TicketStatus } from '../../entities/Ticket';
import { Comment } from '../../entities/Comment';

export interface TicketRepository {
    save(ticket: Ticket): Promise<void>;
    findById(id: string): Promise<Ticket | null>;
    findAll(): Promise<Ticket[]>;
    findByUserId(userId: string): Promise<Ticket[]>;
    saveComment(comment: Comment): Promise<void>;
    update(ticket: Ticket): Promise<void>;
}
