import { Controller } from '@nestjs/common';
import {
  TestServiceController,
  TestServiceControllerMethods,
  TestRequest,
  TestResponse,
  Empty,
} from '@noildm/contracts/dist/gen/test';
import { ActorFacade } from '../../application';

@Controller()
@TestServiceControllerMethods()
export class ActorGrpcController {
  constructor(private readonly actorFacade: ActorFacade) {}
  async test(data: TestRequest): Promise<TestResponse> {
    console.log(data);
    const created = await this.actorFacade.commands.createActor({
      author: data.testRequest,
    });
    return { testResponse: `Good:${created.id}` };
  }

  ping(_: Empty): Empty {
    return { empty: {} as any };
  }
}
