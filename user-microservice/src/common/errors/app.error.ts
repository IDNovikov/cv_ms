export type ErrorLayer =
  | 'domain'
  | 'application'
  | 'infrastructure'
  | 'transport'
  | 'startup'
  | 'unknown';

export interface AppErrorOptions {
  code: string;
  layer: ErrorLayer;
  message: string;
  details?: Record<string, unknown>;
  cause?: unknown;
  retryable?: boolean;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly layer: ErrorLayer;
  public readonly details?: Record<string, unknown>;
  public readonly cause?: unknown;
  public readonly retryable: boolean;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.code = options.code;
    this.layer = options.layer;
    this.details = options.details;
    this.cause = options.cause;
    this.retryable = options.retryable ?? false;
  }
}

export class ApplicationError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super({ code, layer: 'application', message, details, cause });
  }
}

export class NotFoundAppError extends ApplicationError {
  constructor(entity: string, details?: Record<string, unknown>) {
    super(
      'ENTITY_NOT_FOUND',
      `${entity} not found`,
      { entity, ...details },
    );
  }
}

export class ConflictAppError extends ApplicationError {
  constructor(entity: string, details?: Record<string, unknown>) {
    super(
      'ENTITY_CONFLICT',
      `${entity} already exists`,
      { entity, ...details },
    );
  }
}

export class InfrastructureError extends AppError {
  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
    cause?: unknown,
    retryable = true,
  ) {
    super({
      code,
      layer: 'infrastructure',
      message,
      details,
      cause,
      retryable,
    });
  }
}

export class PersistenceError extends InfrastructureError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super('PERSISTENCE_ERROR', message, details, cause);
  }
}

export class DependencyUnavailableError extends InfrastructureError {
  constructor(
    dependency: string,
    details?: Record<string, unknown>,
    cause?: unknown,
  ) {
    super(
      'DEPENDENCY_UNAVAILABLE',
      `${dependency} is unavailable`,
      { dependency, ...details },
      cause,
    );
  }
}

export class StartupError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: unknown) {
    super({
      code: 'STARTUP_ERROR',
      layer: 'startup',
      message,
      details,
      cause,
    });
  }
}
