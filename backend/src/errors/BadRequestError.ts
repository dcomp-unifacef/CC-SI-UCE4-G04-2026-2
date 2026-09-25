import { AppError } from './AppError'

type Errors = {
    field: string,
    rule: string[]
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', public readonly errors: Errors[]) {
        super(message, 400)
    }
}