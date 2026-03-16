import { InfrastructureError } from '../infrastructure.error';

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
