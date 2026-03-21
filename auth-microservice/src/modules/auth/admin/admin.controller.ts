import { Controller } from '@nestjs/common';
import { AdminFacade } from './admin.facade';
import { parsedData } from '../session/session.service';

@Controller()
export class AdminController {
  constructor(private facade: AdminFacade) {}

  async getAllSessionsByAdmin(): Promise<{ data: parsedData[] }> {
    return this.facade.getAllSessionsByAdmin();
  }

  async logoutUsersSessionsByAdmin(userId: string) {
    return this.facade.logoutUserSessionsByAdmin(userId);
  }

  async logoutAllSessionsByAdmin() {
    return this.facade.logoutAllSessionsByAdmin();
  }
}
