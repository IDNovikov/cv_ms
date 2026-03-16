import { ApplicationError } from '../application.error';

export class ConflictAppError extends ApplicationError {
  constructor(entity: string, details?: Record<string, unknown>) {
    super('ENTITY_CONFLICT', `${entity} already exists`, {
      entity,
      ...details,
    });
  }
}
