import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { AppConfigService } from './config/app-config.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const config = app.get(AppConfigService);

  app.enableCors({
    origin: config.appOrigin,
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Helora Backend API')
    .setDescription('Starter backend with auth, CQRS, RBAC, refresh cookies, and Prisma.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  await app.listen(config.port);
}

bootstrap();
