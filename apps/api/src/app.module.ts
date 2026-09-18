import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './companies/company.module';
import { ContactModule } from './contact/contact.module';
import { HealthModule } from './health/health.module';
import { HiringModule } from './hiring/hiring.module';
import { ModerationModule } from './moderation/moderation.module';
import { ProfessionalProfileModule } from './professionals/professional-profile.module';
import { PublishingModule } from './publishing/publishing.module';
import { ReviewModule } from './reviews/review.module';

@Module({
  imports: [
    // Structured JSON logs with a correlation ID (req.id) on every line, so
    // a single request's logs can be grepped/traced end to end. Pretty-prints
    // in dev; emits plain JSON (for log aggregators) everywhere else. Never
    // logs Authorization headers, cookies, or password/token body fields.
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
        autoLogging: { ignore: (req) => req.url === '/health' },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.token',
            'req.body.refreshToken',
            'req.body.accessToken',
            'res.headers["set-cookie"]',
          ],
          censor: '[redacted]',
        },
      },
    }),
    // Global default: 120 req/min per IP, generous enough that a normal
    // page load (which fans out to several endpoints) never trips it.
    // Individual controllers tighten this with @Throttle for
    // brute-force-sensitive or spam-prone routes (auth, contact).
    // Skipped under test: e2e specs fire many rapid sequential requests
    // from the same loopback "IP" and aren't exercising throttling itself.
    // Overridable via env so a load test (which is many concurrent users
    // funneled through one machine's IP) can raise the ceiling instead of
    // just measuring how fast it gets 429'd — see load-tests/README.md.
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: Number(process.env.RATE_LIMIT_TTL_MS ?? 60_000),
          limit: Number(process.env.RATE_LIMIT_MAX ?? 120),
        },
      ],
      skipIf: () => process.env.NODE_ENV === 'test',
    }),
    HealthModule,
    AuthModule,
    ProfessionalProfileModule,
    CompanyModule,
    ReviewModule,
    HiringModule,
    PublishingModule,
    ModerationModule,
    ContactModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
