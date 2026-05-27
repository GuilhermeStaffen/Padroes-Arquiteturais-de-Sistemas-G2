import { Comment } from './Comment';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export class Ticket {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly userId: string,
        public status: TicketStatus,
        public readonly createdAt: Date,
        public comments: Comment[] = []
    ) {
        if (!id) throw new Error('Ticket id é obrigatório');
        if (!title || title.trim().length === 0) throw new Error('Título é obrigatório');
        if (!description || description.trim().length === 0) throw new Error('Descrição é obrigatória');
        if (!userId) throw new Error('UserId é obrigatório');
        if (!status) throw new Error('Status é obrigatório');
        if (!createdAt) throw new Error('CreatedAt é obrigatório');
    }

    public updateStatus(newStatus: TicketStatus): void {
        this.status = newStatus;
    }

    public addComment(comment: Comment): void {
        if (!comment.content || comment.content.trim().length === 0) throw new Error('Comentário é obrigatório');
        this.comments.push(comment);
    }
}
