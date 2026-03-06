export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly at: Date,
  ) {}
}

