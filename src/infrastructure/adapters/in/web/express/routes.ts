import { Router } from 'express';
import { TicketController } from './controllers/TicketController';
import { AuthController } from './controllers/AuthController';
import { CreateTicketUseCase } from '../../../../../application/use-cases/CreateTicketUseCase';
import { UpdateTicketStatusUseCase } from '../../../../../application/use-cases/UpdateTicketStatusUseCase';
import { AddCommentUseCase } from '../../../../../application/use-cases/AddCommentUseCase';
import { MysqlTicketRepository } from '../../../out/database/mysql/MysqlTicketRepository';
import { RabbitMqAdapter } from '../../../out/messaging/amqp/RabbitMqAdapter';
import { MysqlUserRepository } from '../../../out/database/mysql/MysqlUserRepository';
import { authenticate, requireAdmin } from './middlewares/auth';

const router = Router();

const ticketRepository = new MysqlTicketRepository();
const userRepository = new MysqlUserRepository();
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
const authController = new AuthController(userRepository);

router.post('/auth/login', authController.login);

router.post('/tickets', authenticate, (req, res) => ticketController.createTicket(req, res));
router.get('/tickets', authenticate, (req, res) => ticketController.listTickets(req, res));
router.get('/tickets/:id', authenticate, (req, res) => ticketController.getTicket(req, res));
router.patch('/tickets/:id/status', authenticate, requireAdmin, (req, res) => ticketController.updateStatus(req, res));
router.post('/tickets/:id/comments', authenticate, (req, res) => ticketController.addComment(req, res));

export { router as ticketRoutes };
