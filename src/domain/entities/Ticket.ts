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
    ) {}

    public updateStatus(newStatus: TicketStatus): void {
        this.status = newStatus;
    }

    public addComment(comment: Comment): void {
        this.comments.push(comment);
    }
}
