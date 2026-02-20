export class ActorCreatedEvent {
  constructor(
    public readonly actor: string | null,
    public readonly at: string,
  ) {}
}
