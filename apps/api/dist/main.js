"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
const postgres_exception_filter_1 = require("./common/filters/postgres-exception.filter");
async function bootstrap() {
    // bufferLogs holds Nest's own startup log lines until the Pino logger
    // below is ready, so nothing is lost or falls back to the console logger.
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new postgres_exception_filter_1.PostgresExceptionFilter());
    app.enableCors({
        origin: process.env.WEB_ORIGIN?.split(',') ?? 'http://localhost:3000',
        credentials: true,
        // Without this, Chrome/Firefox don't cache the preflight and send a
        // fresh OPTIONS before every single GET/POST/DELETE — doubling the
        // number of round trips to the API on every page.
        maxAge: 86400,
    });
    // Railway (and most PaaS hosts) assign their own port at runtime via
    // PORT — a hardcoded 3001 means the platform's proxy can never reach
    // the container. 3001 remains the local-dev default.
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
bootstrap();
