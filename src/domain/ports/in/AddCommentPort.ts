import { Comment } from '../../entities/Comment';

export interface AddCommentCommand {
    ticketId: string;
    userId: string;
    content: string;
}

export interface AddCommentPort {
    execute(command: AddCommentCommand): Promise<Comment>;
}
