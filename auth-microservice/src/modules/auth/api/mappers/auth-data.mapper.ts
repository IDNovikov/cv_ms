import {
  AuthDataResponse,
  UserRoles,
  UserStatus,
} from '@noildm/contracts/dist/gen/auth';
import { AuthAggregate } from '../../domain/auth.aggregate';
import { Timestamp } from '@noildm/contracts/dist/gen/google/protobuf/timestamp';

export function toGrpcAuthMapper(auth: AuthAggregate): AuthDataResponse {
  let status;

  if (auth.status === 'ACTIVE') status = UserStatus.ACTIVE;
  if (auth.status === 'BANNED') status = UserStatus.BANNED;
  if (auth.status === 'DELETED') status = UserStatus.DELETED;

  let role;
  if (auth.role === 'ADMIN') role = UserRoles.ADMIN;
  if (auth.role === 'USER') role = UserRoles.USER;

  return {
    id: auth.id,
    email: auth.email,
    password: auth.password,
    status,
    role,
    userId: auth.userId,
    isEmailVerified: auth.isEmailVerified,
    createdAt: toTimestamp(auth.createdAt),
    updatedAt: toTimestamp(auth.updatedAt),
  };
}

function toTimestamp(date: Date): Timestamp {
  const milliseconds = date.getTime();
  return {
    seconds: Math.trunc(milliseconds / 1000),
    nanos: (milliseconds % 1000) * 1_000_000,
  };
}
