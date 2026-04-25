export interface IMember {
  requestId: string;
  id: string;
  chatId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  leftAt: Date | null;
  archivedAt: Date | null;
  mutedUntil: Date | null;
  lastReadMessageId: string | null;
  lastReadAt: Date | null;
}

export interface CreateMemberInput {
  requestId: IMember['requestId'];
  chatId: IMember['chatId'];
  userId: IMember['userId'];
  role?: IMember['role'];
}

export interface ChangeMemberRoleInput {
  id: IMember['id'];
  role: IMember['role'];
}

export interface LeaveMemberInput {
  id: IMember['id'];
  userId: IMember['userId'];
}

export interface ArchiveMemberInput {
  id: IMember['id'];
  userId: IMember['userId'];
}

export interface MuteMemberInput {
  id: IMember['id'];
  userId: IMember['userId'];
  mutedUntil: IMember['mutedUntil'];
}

export interface MarkMemberReadInput {
  id: IMember['id'];
  userId: IMember['userId'];
  lastReadMessageId: NonNullable<IMember['lastReadMessageId']>;
  lastReadAt?: IMember['lastReadAt'];
}
