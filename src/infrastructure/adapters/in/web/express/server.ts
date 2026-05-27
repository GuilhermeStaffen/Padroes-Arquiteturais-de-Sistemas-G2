import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { ticketRoutes } from './routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../../../../../public')));

app.use('/api', ticketRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na pota ${PORT}`);
});
