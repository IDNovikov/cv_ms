export abstract class HashPort {
  constructor() {}

  abstract hash(plain: string): Promise<string>;

  abstract compare(plain: string, hash: string): Promise<boolean>;
}
