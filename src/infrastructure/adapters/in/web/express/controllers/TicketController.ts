import { Request, Response } from 'express';
import { CreateTicketPort } from '../../../../../../domain/ports/in/CreateTicketPort';
import { UpdateTicketStatusPort } from '../../../../../../domain/ports/in/UpdateTicketStatusPort';
import { AddCommentPort } from '../../../../../../domain/ports/in/AddCommentPort';
import { GetTicketPort } from '../../../../../../domain/ports/in/GetTicketPort';
import { ListTicketsPort } from '../../../../../../domain/ports/in/ListTicketsPort';
import { TicketStatus } from '../../../../../../domain/entities/Ticket';
import { AuthRequest } from '../middlewares/auth';

export class TicketController {
    constructor(
        private readonly createTicketPort: CreateTicketPort,
        private readonly updateTicketStatusPort: UpdateTicketStatusPort,
        private readonly addCommentPort: AddCommentPort,
        private readonly getTicketPort: GetTicketPort,
        private readonly listTicketsPort: ListTicketsPort
    ) {}

    async createTicket(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { title, description } = req.body;
            const userId = req.user?.id;
            
            if (!userId) {
                res.status(401).json({ error: 'Não autorizado paizão' });
                return;
            }

            const ticket = await this.createTicketPort.execute({ title, description, userId });
            res.status(201).json(ticket);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const ticketId = req.params.id as string;
            const { status } = req.body;
            const userId = req.user?.id || '';

            await this.updateTicketStatusPort.execute({ ticketId, status: status as TicketStatus, userId });
            res.status(200).json({ message: 'Status atualizado com sucesso' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async addComment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const ticketId = req.params.id as string;
            const { content } = req.body;
            const userId = req.user?.id || '';

            if (!userId) {
                res.status(401).json({ error: 'Não autorizado paizão' });
                return;
            }

            const comment = await this.addCommentPort.execute({ ticketId, userId, content });
            res.status(201).json(comment);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getTicket(req: AuthRequest, res: Response): Promise<void> {
        try {
            const ticketId = req.params.id as string;
            const userId = req.user?.id || '';
            const ticket = await this.getTicketPort.execute(ticketId, userId);
            if (!ticket) {
                res.status(404).json({ message: 'Ticket não encontrado' });
                return;
            }
            res.status(200).json(ticket);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listTickets(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id || '';
            const tickets = await this.listTicketsPort.execute(userId);
            res.status(200).json(tickets);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
