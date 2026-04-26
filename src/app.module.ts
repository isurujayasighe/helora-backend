import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AppConfigModule } from './config/app-config.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { BlocksModule } from './blocks/blocks.module';
import { AuditModule } from './audit/audit.module';
import { CustomersModule } from './customers/customers.module';
import { SessionsModule } from './sessions/sessions.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { GroupOrdersModule } from './group-orders/group-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 30,
        },
      ],
    }),
    CqrsModule.forRoot(),
    AppConfigModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    BlocksModule,
    CustomersModule,
    CategoriesModule,
    OrdersModule,
    AuditModule,
    SessionsModule,
    WhatsappModule,
    GroupOrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
