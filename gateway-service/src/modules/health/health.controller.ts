import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class HealthController {
  constructor(private readonly HealthService: HealthService) {}

  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        data: {
          status: 'ok',
          timeStamp: '2026-02-02T08:51:02.751Z',
          message: 'helth check is OK',
        },
        timestamp: '2026-02-02T08:51:02.751Z',
        path: '/api/health',
        method: 'GET',
      },
    },
  })
  @Get('health')
  public helthCheck(): unknown {
    return this.HealthService.helthCheck();
  }
}
