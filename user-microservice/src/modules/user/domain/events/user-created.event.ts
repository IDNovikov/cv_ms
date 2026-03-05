export class UserCreatedEvent {
  constructor(
    public readonly actor: string | null,
    public readonly at: string,
  ) {}
}

