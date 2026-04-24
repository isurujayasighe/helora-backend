export type CurrentUserContext = {
  userId: string;
  email: string;
  tenantId: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
};
