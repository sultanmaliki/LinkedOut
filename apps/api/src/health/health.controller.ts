import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

import { client } from '@linkedout/database';

interface HealthResponse {
  status: (code: number) => { json: (body: unknown) => void };
}

@Controller('health')
export class HealthController {
  @Get()
  async check(@Res() res: HealthResponse) {
    try {
      await client`select 1`;
      res
        .status(HttpStatus.OK)
        .json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
    } catch {
      res
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .json({ status: 'error', db: 'unreachable', timestamp: new Date().toISOString() });
    }
  }
}
