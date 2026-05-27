import { v4 as uuidv4 } from 'uuid';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { Comment } from '../../domain/entities/Ticket';
import { AddCommentPort, AddCommentCommand } from '../../domain/ports/in/AddCommentPort';

export class AddCommentUseCase implements AddCommentPort {
    constructor(
        private readonly ticketRepository: TicketRepository
    ) {}

    public async execute(command: AddCommentCommand): Promise<Comment> {
        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        const comment: Comment = {
            id: uuidv4(),
            ticketId: command.ticketId,
            userId: command.userId,
            content: command.content,
            createdAt: new Date()
        };

        await this.ticketRepository.saveComment(comment);
        
        return comment;
    }
}
