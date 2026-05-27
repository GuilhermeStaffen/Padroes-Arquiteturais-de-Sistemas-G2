import { Router } from 'express';
import { TicketController } from './controllers/TicketController';
import { AuthController } from './controllers/AuthController';
import { CreateTicketUseCase } from '../../../../../application/use-cases/CreateTicketUseCase';
import { UpdateTicketStatusUseCase } from '../../../../../application/use-cases/UpdateTicketStatusUseCase';
import { AddCommentUseCase } from '../../../../../application/use-cases/AddCommentUseCase';
import { GetTicketUseCase } from '../../../../../application/use-cases/GetTicketUseCase';
import { ListTicketsUseCase } from '../../../../../application/use-cases/ListTicketsUseCase';
import { LoginUseCase } from '../../../../../application/use-cases/LoginUseCase';
import { MysqlTicketRepository } from '../../../out/database/mysql/MysqlTicketRepository';
import { RabbitMqAdapter } from '../../../out/messaging/amqp/RabbitMqAdapter';
import { MysqlUserRepository } from '../../../out/database/mysql/MysqlUserRepository';
import { authenticate, requireAdmin } from './middlewares/auth';

const router = Router();

const ticketRepository = new MysqlTicketRepository();
const userRepository = new MysqlUserRepository();
const eventPublisher = new RabbitMqAdapter();

const createTicketUseCase = new CreateTicketUseCase(ticketRepository, userRepository, eventPublisher);
const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(ticketRepository, userRepository, eventPublisher);
const addCommentUseCase = new AddCommentUseCase(ticketRepository, userRepository, eventPublisher);
const getTicketUseCase = new GetTicketUseCase(ticketRepository, userRepository);
const listTicketsUseCase = new ListTicketsUseCase(ticketRepository, userRepository);
const loginUseCase = new LoginUseCase(userRepository);

const ticketController = new TicketController(
    createTicketUseCase,
    updateTicketStatusUseCase,
    addCommentUseCase,
    getTicketUseCase,
    listTicketsUseCase
);
const authController = new AuthController(loginUseCase);

router.post('/auth/login', authController.login);

router.post('/tickets', authenticate, (req, res) => ticketController.createTicket(req, res));
router.get('/tickets', authenticate, (req, res) => ticketController.listTickets(req, res));
router.get('/tickets/:id', authenticate, (req, res) => ticketController.getTicket(req, res));
router.patch('/tickets/:id/status', authenticate, requireAdmin, (req, res) => ticketController.updateStatus(req, res));
router.post('/tickets/:id/comments', authenticate, (req, res) => ticketController.addComment(req, res));

export { router as ticketRoutes };
