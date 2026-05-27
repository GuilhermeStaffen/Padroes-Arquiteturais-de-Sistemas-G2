import { Request, Response } from 'express';
import { CreateTicketPort } from '../../../../../../domain/ports/in/CreateTicketPort';
import { UpdateTicketStatusPort } from '../../../../../../domain/ports/in/UpdateTicketStatusPort';
import { AddCommentPort } from '../../../../../../domain/ports/in/AddCommentPort';
import { MysqlTicketRepository } from '../../../../out/database/mysql/MysqlTicketRepository';
import { TicketStatus } from '../../../../../../domain/entities/Ticket';
import { AuthRequest } from '../middlewares/auth';

export class TicketController {
    constructor(
        private readonly createTicketPort: CreateTicketPort,
        private readonly updateTicketStatusPort: UpdateTicketStatusPort,
        private readonly addCommentPort: AddCommentPort,
        private readonly ticketRepository: MysqlTicketRepository 
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
            
            await this.updateTicketStatusPort.execute({ ticketId, status: status as TicketStatus, userId: req.user?.id || '' });
            res.status(200).json({ message: 'Status atualizado com sucesso' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async addComment(req: AuthRequest, res: Response): Promise<void> {
        try {
            const ticketId = req.params.id as string;
            const { content } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const comment = await this.addCommentPort.execute({ ticketId, userId, content });
            res.status(201).json(comment);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getTicket(req: Request, res: Response): Promise<void> {
        try {
            const ticketId = req.params.id as string;
            const ticket = await this.ticketRepository.findById(ticketId);
            if (!ticket) {
                res.status(404).json({ message: 'Ticket não encontrado' });
                return;
            }
            res.status(200).json(ticket);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async listTickets(req: Request, res: Response): Promise<void> {
        try {
            const tickets = await this.ticketRepository.findAll();
            res.status(200).json(tickets);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

