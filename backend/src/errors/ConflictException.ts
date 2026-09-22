import { AppError } from './AppError'

export class ConflictException extends AppError {
    constructor(message = 'Conflict Error') {
        super(message, 404)
    }
}