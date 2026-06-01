export abstract class AggregateRoot<T> {
  private readonly events: T[] = [];

  protected addEvent(event: T): void {
    this.events.push(event);
  }

  public pullEvents(): T[] {
    const events = [...this.events];
    this.events.length = 0;
    return events;
  }
}
