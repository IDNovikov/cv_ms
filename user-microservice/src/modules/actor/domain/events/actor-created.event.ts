export class ActorCreatedEvent {
  constructor(
    public readonly actorId: string,
    public readonly at: string,
  ) {}
}
