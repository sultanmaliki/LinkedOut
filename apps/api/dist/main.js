"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const postgres_exception_filter_1 = require("./common/filters/postgres-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new postgres_exception_filter_1.PostgresExceptionFilter());
    app.enableCors({
        origin: process.env.WEB_ORIGIN?.split(',') ?? 'http://localhost:3000',
        credentials: true,
    });
    await app.listen(3001);
}
bootstrap();
