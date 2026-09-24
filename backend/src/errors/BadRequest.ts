import { AppError } from './AppError'

export class BadRequest extends AppError {
    constructor(message = 'Bad Request') {
        super(message, 400)
    }
}