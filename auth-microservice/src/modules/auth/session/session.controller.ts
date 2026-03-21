import { Controller } from '@nestjs/common';
import { DeleteSessionDTO } from './dto/deleteSession.dto';

import { SessionFacade } from './session.facade';

@Controller()
export class SessionsController {
  constructor(private facade: SessionFacade) {}
  async getUserSessions(token: string) {
    return this.facade.getUserSessions(token);
  }

  async logoutSession(token: string, params: DeleteSessionDTO) {
    return this.facade.logoutSession(token, params.deviceId);
  }
}
