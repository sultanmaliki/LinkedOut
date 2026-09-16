import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

// Passing a non-UUID string as an :id param (or a forged JWT's sub claim)
// reaches a Drizzle query, which throws a raw Postgres error instead of a
// NestJS HttpException. Left unhandled, Nest's default behavior turns that
// into an opaque 500 for what is really a 400 (bad input). This filter
// leaves every normal HttpException (validation errors, 401/403/404, etc.)
// completely untouched, and only reclassifies the specific Postgres
// "invalid_text_representation" error (code 22P02) covering invalid
// UUID/int/etc. input.
const POSTGRES_INVALID_INPUT_CODE = '22P02';

@Catch()
export class PostgresExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PostgresExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<{
      status: (code: number) => { json: (body: unknown) => void };
    }>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (this.findPostgresErrorCode(exception) === POSTGRES_INVALID_INPUT_CODE) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid identifier format',
        error: 'Bad Request',
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : exception,
      undefined,
      'UnhandledException',
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }

  private findPostgresErrorCode(exception: unknown): string | undefined {
    let current: unknown = exception;

    for (let depth = 0; depth < 5 && current; depth += 1) {
      const candidate = current as { code?: unknown; cause?: unknown };

      if (typeof candidate.code === 'string') {
        return candidate.code;
      }

      current = candidate.cause;
    }

    return undefined;
  }
}
