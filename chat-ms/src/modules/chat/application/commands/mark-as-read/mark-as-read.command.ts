import { MarkAsReadDto } from '../dto/mark-as-read.dto';

export class MarkAsReadCommand {
  constructor(public readonly dto: MarkAsReadDto) {}
}
