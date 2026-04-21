# Helora Backend Starter

A runnable NestJS backend starter for your startup project.

## Included
- NestJS 11
- Prisma + PostgreSQL
- Passport local + JWT auth
- Access token + refresh token cookie flow
- CQRS for auth and blocks
- RBAC with permissions guard
- Global validation and centralized error handling
- Swagger docs
- Docker Compose for PostgreSQL
- Seed data

## Default seeded admin
- Email: `admin@helora.local`
- Password: `Admin@12345`
- Tenant slug: `demo-garments`

## Quick start

### 1. Copy env
```bash
cp .env.example .env
```

### 2. Start PostgreSQL
```bash
docker compose up -d
```

### 3. Install dependencies
```bash
npm install --include=dev
```

### Important
Use a normal development install for the first run:
```bash
npm install --include=dev
```
If your shell or CI has `NODE_ENV=production`, Nest CLI, Prisma CLI, TypeScript, and ts-node will not be installed and `npm run start:dev` / migrations will fail.


### 4. Generate Prisma client
```bash
npm run prisma:generate
```

### 5. Run migrations
```bash
npx prisma migrate dev --name init
```

### 6. Seed database
```bash
npm run prisma:seed
```

### 7. Start API
```bash
npm run start:dev
```

## URLs
- API base: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`
- Health: `http://localhost:3000/api/v1/health`

## Main auth flow

### Register
`POST /api/v1/auth/register`
```json
{
  "email": "user@example.com",
  "password": "Password@123",
  "firstName": "Isuru",
  "lastName": "Perera",
  "tenantSlug": "demo-garments"
}
```

### Login
`POST /api/v1/auth/login`
```json
{
  "email": "admin@helora.local",
  "password": "Admin@12345"
}
```
Returns an access token and sets `refresh_token` cookie.

### Refresh
`POST /api/v1/auth/refresh`
The browser sends the cookie automatically.

### Me
`GET /api/v1/auth/me`
Header:
```bash
Authorization: Bearer <access-token>
```

## Sample blocks endpoints
- `GET /api/v1/blocks`
- `POST /api/v1/blocks`
- `GET /api/v1/blocks/:id`
- `PATCH /api/v1/blocks/:id`
- `DELETE /api/v1/blocks/:id`

## Permission model
The seed creates:
- `SUPER_ADMIN`
- `VIEWER`

Permissions are formatted in access tokens like:
- `blocks:create`
- `blocks:read`
- `blocks:update`
- `blocks:delete`

## Notes
- Refresh token is stored as a hashed value in the database.
- Access token is short-lived.
- Refresh token is stored in an HttpOnly cookie.
- CQRS is applied to auth and blocks so you can extend the project gradually.
- This is a modular monolith starter, which is a good base before splitting into microservices later.

## Good next additions
- email verification
- forgot/reset password
- MFA
- tenant admin screens
- audit log APIs
- file uploads
- reports and dashboards
