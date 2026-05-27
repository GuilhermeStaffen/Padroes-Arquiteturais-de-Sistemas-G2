import { Router } from 'express';
import { TicketController } from './controllers/TicketController';
import { CreateTicketUseCase } from '../../../../../application/use-cases/CreateTicketUseCase';
import { UpdateTicketStatusUseCase } from '../../../../../application/use-cases/UpdateTicketStatusUseCase';
import { AddCommentUseCase } from '../../../../../application/use-cases/AddCommentUseCase';
import { MysqlTicketRepository } from '../../../out/database/mysql/MysqlTicketRepository';
import { RabbitMqAdapter } from '../../../out/messaging/amqp/RabbitMqAdapter';

const router = Router();

const ticketRepository = new MysqlTicketRepository();
const eventPublisher = new RabbitMqAdapter();

const createTicketUseCase = new CreateTicketUseCase(ticketRepository, eventPublisher);
const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(ticketRepository, eventPublisher);
const addCommentUseCase = new AddCommentUseCase(ticketRepository);

const ticketController = new TicketController(
    createTicketUseCase,
    updateTicketStatusUseCase,
    addCommentUseCase,
    ticketRepository
);

router.post('/tickets', (req, res) => ticketController.createTicket(req, res));
router.get('/tickets', (req, res) => ticketController.listTickets(req, res));
router.get('/tickets/:id', (req, res) => ticketController.getTicket(req, res));
router.patch('/tickets/:id/status', (req, res) => ticketController.updateStatus(req, res));
router.post('/tickets/:id/comments', (req, res) => ticketController.addComment(req, res));

export { router as ticketRoutes };
