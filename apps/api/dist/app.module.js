"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const nestjs_pino_1 = require("nestjs-pino");
const auth_module_1 = require("./auth/auth.module");
const company_module_1 = require("./companies/company.module");
const contact_module_1 = require("./contact/contact.module");
const health_module_1 = require("./health/health.module");
const hiring_module_1 = require("./hiring/hiring.module");
const moderation_module_1 = require("./moderation/moderation.module");
const professional_profile_module_1 = require("./professionals/professional-profile.module");
const publishing_module_1 = require("./publishing/publishing.module");
const review_module_1 = require("./reviews/review.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Structured JSON logs with a correlation ID (req.id) on every line, so
            // a single request's logs can be grepped/traced end to end. Pretty-prints
            // in dev; emits plain JSON (for log aggregators) everywhere else. Never
            // logs Authorization headers, cookies, or password/token body fields.
            nestjs_pino_1.LoggerModule.forRoot({
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
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [
                    {
                        ttl: Number(process.env.RATE_LIMIT_TTL_MS ?? 60_000),
                        limit: Number(process.env.RATE_LIMIT_MAX ?? 120),
                    },
                ],
                skipIf: () => process.env.NODE_ENV === 'test',
            }),
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            professional_profile_module_1.ProfessionalProfileModule,
            company_module_1.CompanyModule,
            review_module_1.ReviewModule,
            hiring_module_1.HiringModule,
            publishing_module_1.PublishingModule,
            moderation_module_1.ModerationModule,
            contact_module_1.ContactModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
