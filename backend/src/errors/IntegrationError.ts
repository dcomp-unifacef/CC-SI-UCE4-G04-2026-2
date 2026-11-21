import { AppError } from './AppError';

export class IntegrationError extends AppError {
  constructor(message = 'External integration is unavailable') {
    super(message, 502);
  }
}
