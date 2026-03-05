import { Controller } from '@nestjs/common';
import {
  TestServiceController,
  TestServiceControllerMethods,
  TestRequest,
  TestResponse,
  Empty,
} from '@noildm/contracts/dist/gen/test';
import { UserFacade } from '../../application';

@Controller()
@TestServiceControllerMethods()
export class UserGrpcController {
  constructor(private readonly facade: UserFacade) {}

  async test(data: TestRequest): Promise<TestResponse> {
    console.log(data);
    const created = await this.facade.commands.createUser({
      author: data.testRequest,
    });
    return { testResponse: `Good:${created.id}` };
  }

  ping(_: Empty): Empty {
    return { empty: {} as any };
  }
}
