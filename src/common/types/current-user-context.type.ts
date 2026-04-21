export type CurrentUserContext = {
  sub: string;
  email: string;
  tenantId: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
};
