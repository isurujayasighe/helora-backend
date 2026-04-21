import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Something went wrong';
    let errors: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const data = exceptionResponse as { message?: string | string[]; error?: string };
        if (Array.isArray(data.message)) {
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
          errors = data.message;
        } else if (typeof data.message === 'string') {
          message = data.message;
        }

        if (typeof data.error === 'string' && status === HttpStatus.BAD_REQUEST) {
          code = 'VALIDATION_ERROR';
        }
      }

      if (status === HttpStatus.UNAUTHORIZED) code = 'UNAUTHORIZED';
      if (status === HttpStatus.FORBIDDEN) code = 'FORBIDDEN';
      if (status === HttpStatus.NOT_FOUND) code = 'NOT_FOUND';
      if (status === HttpStatus.CONFLICT) code = 'CONFLICT';
      if (status === HttpStatus.TOO_MANY_REQUESTS) code = 'RATE_LIMITED';
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'CONFLICT';
        message = 'A record with the same unique value already exists';
      }
    }

    response.status(status).json({
      success: false,
      code,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.headers['x-request-id'] ?? null,
    });
  }
}
