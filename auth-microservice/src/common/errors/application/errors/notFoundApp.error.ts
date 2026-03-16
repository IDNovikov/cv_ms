import { ApplicationError } from '../application.error';

export class NotFoundAppError extends ApplicationError {
  constructor(entity: string, details?: Record<string, unknown>) {
    super('ENTITY_NOT_FOUND', `${entity} not found`, { entity, ...details });
  }
}
