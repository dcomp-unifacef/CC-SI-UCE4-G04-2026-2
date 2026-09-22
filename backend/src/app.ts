import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import logger from 'morgan';
import cors from 'cors';
import { NotFoundError } from './errors/NotFoundError';
import { errorHandler } from './middlewares/errorHandler';
import patientsRouter from './routes/patient';

const app = express();

// Midllewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(cors());

// Rotas
app.use('/patients', patientsRouter)

// Fallback
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} does not exist`));
});

// Middleware de Tratamento de Erros
app.use(errorHandler);

export default app;
