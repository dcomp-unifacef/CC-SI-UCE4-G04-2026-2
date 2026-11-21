import type { UserRole } from '../generated/prisma/enums';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        role: UserRole;
        email: string;
      };
      uploads?: Array<{
        fieldName: string;
        originalName: string;
        mimeType: string;
        buffer: Buffer;
      }>;
      uploadFields?: Record<string, string>;
    }
  }
}

export {};
