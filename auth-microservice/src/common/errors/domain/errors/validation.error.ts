import { DomainError } from '../domain.error';

export class DomainValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DOMAIN_VALIDATION_FAILED', message, details);
  }
}
