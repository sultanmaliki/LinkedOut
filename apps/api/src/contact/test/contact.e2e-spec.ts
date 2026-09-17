import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { client } from '@linkedout/database';
import { AppModule } from '../../app.module';

describe('Contact HTTP (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await client.end();
  });

  it('POST /contact accepts a valid message with no authentication required', async () => {
    const response = await request(app.getHttpServer())
      .post('/contact')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'I have a question about verifying my company.',
      })
      .expect(201);

    expect(response.body).toEqual({ received: true });
  });

  it('POST /contact returns 400 for an invalid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/contact')
      .send({ name: 'A', email: 'not-an-email', message: 'short' })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('name'),
        expect.stringContaining('email'),
        expect.stringContaining('message'),
      ]),
    );
  });

  it('POST /contact ignores server-controlled fields', async () => {
    const response = await request(app.getHttpServer())
      .post('/contact')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        message: 'I have a question about verifying my company.',
        id: 'attacker-chosen-id',
      })
      .expect(201);

    expect(response.body).toEqual({ received: true });
  });
});
