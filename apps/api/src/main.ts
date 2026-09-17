import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PostgresExceptionFilter } from './common/filters/postgres-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new PostgresExceptionFilter());
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(',') ?? 'http://localhost:3000',
    credentials: true,
    // Without this, Chrome/Firefox don't cache the preflight and send a
    // fresh OPTIONS before every single GET/POST/DELETE — doubling the
    // number of round trips to the API on every page.
    maxAge: 86400,
  });
  await app.listen(3001);
}

bootstrap();
