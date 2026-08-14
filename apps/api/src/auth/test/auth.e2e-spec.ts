import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { client } from '@linkedout/database';
import { AppModule } from '../../app.module';

describe('Auth HTTP (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await client.end();
  });

  it('POST /auth/register returns 201 and tokens', async () => {
    const email = `e2e-${Date.now()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'E2E User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    expect(response.body.user.email).toBe(email);
    expect(response.body.user.role).toBe('PROFESSIONAL');
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
  });

  it('POST /auth/login returns 201 for valid credentials', async () => {
    const email = `e2e-login-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Login User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'supersecret1',
      })
      .expect(201);

    expect(response.body.user.email).toBe(email);
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
  });

  it('POST /auth/login returns 401 for invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'missing-e2e@example.com',
        password: 'wrongpass',
      })
      .expect(401);
  });

  it('POST /auth/register returns 400 for invalid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'A',
        email: 'not-an-email',
        password: 'short',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('name'),
        expect.stringContaining('email'),
        expect.stringContaining('password'),
      ]),
    );
  });

  it('POST /auth/refresh returns 400 when refreshToken is missing', async () => {
    await request(app.getHttpServer()).post('/auth/refresh').send({}).expect(400);
  });
});
