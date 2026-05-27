import { v4 as uuidv4 } from 'uuid';
import { TicketRepository } from '../../domain/ports/out/TicketRepository';
import { UserRepository } from '../../domain/ports/out/UserRepository';
import { Comment } from '../../domain/entities/Comment';
import { AddCommentPort, AddCommentCommand } from '../../domain/ports/in/AddCommentPort';

export class AddCommentUseCase implements AddCommentPort {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly userRepository: UserRepository
    ) { }

    public async execute(command: AddCommentCommand): Promise<Comment> {

        const user = await this.userRepository.findById(command.userId);
        if (!user) {
            throw new Error('Usuário não autorizado a comentar o ticket');
        }

        const ticket = await this.ticketRepository.findById(command.ticketId);
        if (!ticket) {
            throw new Error('Ticket não encontrado');
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
