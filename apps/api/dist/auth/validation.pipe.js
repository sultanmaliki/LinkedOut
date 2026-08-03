'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.authValidationPipe = void 0;
const common_1 = require('@nestjs/common');
exports.authValidationPipe = new common_1.ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});
