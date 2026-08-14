'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const common_1 = require('@nestjs/common');
const testing_1 = require('@nestjs/testing');
const supertest_1 = __importDefault(require('supertest'));
const database_1 = require('@linkedout/database');
const app_module_1 = require('../../app.module');
describe('Auth HTTP (e2e)', () => {
  let app;
  beforeAll(async () => {
    const moduleFixture = await testing_1.Test.createTestingModule({
      imports: [app_module_1.AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });
  afterAll(async () => {
    await app.close();
    await database_1.client.end();
  });
  it('POST /auth/register returns 201 and tokens', async () => {
    const email = `e2e-${Date.now()}@example.com`;
    const response = await (0, supertest_1.default)(app.getHttpServer())
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
    await (0, supertest_1.default)(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Login User',
        email,
        password: 'supersecret1',
      })
      .expect(201);
    const response = await (0, supertest_1.default)(app.getHttpServer())
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
    await (0, supertest_1.default)(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'missing-e2e@example.com',
        password: 'wrongpass',
      })
      .expect(401);
  });
  it('POST /auth/register returns 400 for invalid payload', async () => {
    const response = await (0, supertest_1.default)(app.getHttpServer())
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
    await (0, supertest_1.default)(app.getHttpServer()).post('/auth/refresh').send({}).expect(400);
  });
});
