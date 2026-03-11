import { ValidationError } from 'class-validator';
import { AppError } from '../app.error';

export class DomainError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super({
      code,
      layer: 'domain',
      message,
      details,
    });
    this.name = DomainError.name;
  }
}
