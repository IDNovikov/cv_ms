import { Controller, Delete, Get } from '@nestjs/common';
import { DeleteSessionDTO } from './dto/deleteSession.dto';

import { SessionFacade } from './session.facade';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private facade: SessionFacade) {}
  @Get()
  async getUserSessions(token: string) {
    return this.facade.getUserSessions(token);
  }

  @Delete()
  async logoutSession(token: string, params: DeleteSessionDTO) {
    return this.facade.logoutSession(token, params.deviceId);
  }
}
