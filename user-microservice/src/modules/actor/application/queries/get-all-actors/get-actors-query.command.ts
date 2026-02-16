import { GetPaginatedActor } from '../dto/get-actors-query.dto';

export class GetActorsQuery {
  constructor(public readonly dto: GetPaginatedActor) {}
}
