import { InfrastructureError } from '../infrastructure.error';

export class PersistenceError extends InfrastructureError {
  constructor(
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super('PERSISTENCE_ERROR', message, details, cause);
  }
}
