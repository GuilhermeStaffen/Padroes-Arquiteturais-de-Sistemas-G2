import { Comment } from '../../entities/Ticket';

export interface AddCommentCommand {
    ticketId: string;
    userId: string;
    content: string;
}

export interface AddCommentPort {
    execute(command: AddCommentCommand): Promise<Comment>;
}
