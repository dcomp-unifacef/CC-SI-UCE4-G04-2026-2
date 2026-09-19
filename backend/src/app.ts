import express, { Request, Response } from 'express';
import logger from 'morgan';
import cors from 'cors';

const app = express();

// Midllewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(cors());

// Rotas
app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World!');
});

export default app;