import { MessageKind } from '@noildm/contracts/dist/gen/chat';
import { MessageKind as DomainMessageKind } from '../../../domain';

export function toGrpcMessageKind(kind: DomainMessageKind): MessageKind {
  return kind === 'SYSTEM' ? MessageKind.SYSTEM : MessageKind.TEXT;
}
