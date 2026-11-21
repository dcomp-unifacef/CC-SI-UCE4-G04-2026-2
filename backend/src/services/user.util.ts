import type { User } from '../generated/prisma/client';

export type PublicUser = Omit<User, 'passwordHash'>;

export function getPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
