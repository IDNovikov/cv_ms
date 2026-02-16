import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { HealthResponseDTO } from './DTO';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({
    type: HealthResponseDTO,
  })
  @Get('health')
  public helthCheck(): unknown {
    return this.appService.helthCheck();
  }
}
