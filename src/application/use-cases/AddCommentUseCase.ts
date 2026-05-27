import { v4 as uuidv4 } from 'uuid';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { UserRepository } from '../../domain/ports/out/UserRepository';
import { EventPublisher } from '../../domain/ports/out/EventPublisher';
import { Comment } from '../../domain/entities/Comment';
import { AddCommentPort, AddCommentCommand } from '../../domain/ports/in/AddCommentPort';

export class AddCommentUseCase implements AddCommentPort {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly userRepository: UserRepository,
        private readonly eventPublisher: EventPublisher
    ) { }

    public async execute(command: AddCommentCommand): Promise<Comment> {

        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new Error('Ticket não encontrado');
        }

        if (!user.isAdmin && ticket.userId !== command.userId) {
            throw new Error('Usuário não autorizado a comentar neste ticket');
        }

        const comment: Comment = {
            id: uuidv4(),
            ticketId: command.ticketId,
            userId: command.userId,
            content: command.content,
            createdAt: new Date()
        };

        ticket.addComment(comment);
        await this.ticketRepository.saveComment(comment);

        await this.eventPublisher.publish({
            eventName: 'CommentAdded',
            payload: {
                commentId: comment.id,
                ticketId: ticket.id,
                userId: user.id,
                username: user.username,
                content: comment.content,
                createdAt: comment.createdAt
            },
            timestamp: new Date()
        });

        return comment;
    }
}
