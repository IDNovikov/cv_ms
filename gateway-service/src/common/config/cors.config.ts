import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export function getCorsConfig(configService: ConfigService): CorsOptions {
  return {
    origin: configService.getOrThrow<string>('CORS').split(','),
    credentials: true,
  };
}
