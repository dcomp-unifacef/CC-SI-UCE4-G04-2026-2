import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import logger from 'morgan';
import cors from 'cors';
import 'reflect-metadata';
import { NotFoundError } from './errors/NotFoundError';
import { errorHandler } from './middlewares/errorHandler.middleware';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';
import patientRouter from './routes/patient.route';
import cpapModelRouter from './routes/cpap-model.route';
import reportRouter from './routes/report.route';
import templateRouter from './routes/template.route';
import messageRouter from './routes/message.route';
import automationJobRouter from './routes/automation-job.route';
import systemSettingRouter from './routes/system-setting.route';
import dashboardRouter from './routes/dashboard.route';
import evolutionRouter from './routes/evolution.route';

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logger(':method :status :response-time ms'));

const allowedOrigins = (
  process.env.APP_ORIGINS ??
  process.env.APP_ORIGIN ??
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS'));
    },
  }),
);

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/patients', patientRouter);
app.use('/cpap-models', cpapModelRouter);
app.use('/reports', reportRouter);
app.use('/message-templates', templateRouter);
app.use('/messages', messageRouter);
app.use('/automation-jobs', automationJobRouter);
app.use('/settings', systemSettingRouter);
app.use('/dashboard', dashboardRouter);
app.use('/integrations/whatsapp', evolutionRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Fallback
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} does not exist`));
});

// Middleware de Tratamento de Erros
app.use(errorHandler);

export default app;
