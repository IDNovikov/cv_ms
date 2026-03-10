import { ValidationError } from 'class-validator';
import { AppError } from './app.error';

export class DomainError extends AppError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super({
      code,
      layer: 'domain',
      message,
      details,
    });
    this.name = DomainError.name;
  }
}

export class DomainValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DOMAIN_VALIDATION_FAILED', message, details);
    this.name = DomainValidationError.name;
  }

  static fromClassValidator(errors: ValidationError[], message?: string) {
    const collected: string[] = [];
    for (const err of errors) {
      if (!err.constraints) continue;
      for (const [, text] of Object.entries(err.constraints)) {
        collected.push(text);
      }
    }

    return new DomainValidationError(
      message ?? 'Domain validation failed',
      { violations: collected },
    );
  }
}
