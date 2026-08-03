import { ValidationPipe } from '@nestjs/common';

export const authValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});
