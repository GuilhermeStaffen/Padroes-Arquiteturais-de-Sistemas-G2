import { TicketRepository } from '../../../../../domain/ports/out/TicketRepository';
import { Ticket, TicketStatus } from '../../../../../domain/entities/Ticket';
import { Comment } from '../../../../../domain/entities/Comment';
import { dbPool } from './MysqlConnection';
import { RowDataPacket } from 'mysql2';

export class MysqlTicketRepository implements TicketRepository {
    async save(ticket: Ticket): Promise<void> {
        await dbPool.execute(
            'INSERT INTO tickets (id, title, description, user_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [ticket.id, ticket.title, ticket.description, ticket.userId, ticket.status, ticket.createdAt]
        );
    }

    async findById(id: string): Promise<Ticket | null> {
        const [ticketRows] = await dbPool.execute<RowDataPacket[]>('SELECT * FROM tickets WHERE id = ?', [id]);
        if (ticketRows.length === 0) {
            return null;
        }

        const row = ticketRows[0];
        const ticket = new Ticket(
            row.id,
            row.title,
            row.description,
            row.user_id,
            row.status as TicketStatus,
            new Date(row.created_at)
        );

        const [commentRows] = await dbPool.execute<RowDataPacket[]>('SELECT * FROM comments WHERE ticket_id = ? ORDER BY created_at ASC', [id]);
        
        ticket.comments = commentRows.map(c => ({
            id: c.id,
            ticketId: c.ticket_id,
            userId: c.user_id,
            content: c.content,
            createdAt: new Date(c.created_at)
        }));

        return ticket;
    }

    async findAll(): Promise<Ticket[]> {
        const [ticketRows] = await dbPool.execute<RowDataPacket[]>('SELECT * FROM tickets ORDER BY created_at DESC');
        return ticketRows.map(row => new Ticket(
            row.id,
            row.title,
            row.description,
            row.user_id,
            row.status as TicketStatus,
            new Date(row.created_at)
        ));
    }

    async saveComment(comment: Comment): Promise<void> {
        await dbPool.execute(
            'INSERT INTO comments (id, ticket_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
            [comment.id, comment.ticketId, comment.userId, comment.content, comment.createdAt]
        );
    }

    async updateStatus(id: string, status: TicketStatus): Promise<void> {
        await dbPool.execute('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    }
}
