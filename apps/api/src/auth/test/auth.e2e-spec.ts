import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { eq } from 'drizzle-orm';

import { client, db, professionalProfiles, users } from '@linkedout/database';
import { AppModule } from '../../app.module';
import { PostgresExceptionFilter } from '../../common/filters/postgres-exception.filter';

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
    app.useGlobalFilters(new PostgresExceptionFilter());

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

  it('POST /auth/register returns 400 for a whitespace-only password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Space Case',
        email: `e2e-space-${Date.now()}@example.com`,
        password: '        ',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('whitespace')]),
    );
  });

  it('POST /auth/refresh returns 400 when refreshToken is missing', async () => {
    await request(app.getHttpServer()).post('/auth/refresh').send({}).expect(400);
  });

  it('POST /auth/register returns an unverified user with a dev verification token', async () => {
    const email = `e2e-verify-${Date.now()}@example.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Verify User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    expect(response.body.user.emailVerified).toBe(false);
    expect(response.body.devVerificationToken).toBeTruthy();

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/verify-email verifies the account and is reflected on next login', async () => {
    const email = `e2e-verify-flow-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Verify Flow User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const verifyResponse = await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: registerResponse.body.devVerificationToken })
      .expect(201);

    // Verifying returns a fresh session (like login/register), so clicking
    // the link logs the user in even on a device that never registered.
    expect(verifyResponse.body.user.emailVerified).toBe(true);
    expect(verifyResponse.body.accessToken).toBeTruthy();
    expect(verifyResponse.body.refreshToken).toBeTruthy();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'supersecret1' })
      .expect(201);

    expect(loginResponse.body.user.emailVerified).toBe(true);

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/verify-email returns 401 for an invalid token', async () => {
    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: 'not-a-real-token' })
      .expect(401);
  });

  it('POST /auth/resend-verification sends a new token for the authenticated user', async () => {
    const email = `e2e-resend-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Resend User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const resendResponse = await request(app.getHttpServer())
      .post('/auth/resend-verification')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .expect(201);

    expect(resendResponse.body.sent).toBe(true);
    expect(resendResponse.body.devVerificationToken).toBeTruthy();

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/resend-verification returns 401 without an access token', async () => {
    await request(app.getHttpServer()).post('/auth/resend-verification').expect(401);
  });

  it('POST /auth/resend-verification returns 409 once already verified', async () => {
    const email = `e2e-resend-verified-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Already Verified User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token: registerResponse.body.devVerificationToken })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/resend-verification')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .expect(409);

    await db.delete(users).where(eq(users.email, email));
  });

  it('forgot-password → reset-password logs the user in with the new password', async () => {
    const email = `e2e-forgot-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Forgot User', email, password: 'supersecret1' })
      .expect(201);

    const forgotResponse = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email })
      .expect(201);

    expect(forgotResponse.body.sent).toBe(true);
    expect(forgotResponse.body.devResetToken).toBeTruthy();

    const resetResponse = await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: forgotResponse.body.devResetToken, newPassword: 'brandnewpass1' })
      .expect(201);

    expect(resetResponse.body.user.email).toBe(email);
    expect(resetResponse.body.accessToken).toBeTruthy();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'supersecret1' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'brandnewpass1' })
      .expect(201);

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/forgot-password returns 201 with the same body for an unregistered email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'never-registered-e2e@example.com' })
      .expect(201);

    expect(response.body).toEqual({ sent: true });
  });

  it('POST /auth/reset-password returns 400 for a whitespace-only new password', async () => {
    const email = `e2e-reset-space-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Reset Space', email, password: 'supersecret1' })
      .expect(201);

    const forgotResponse = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: forgotResponse.body.devResetToken, newPassword: '        ' })
      .expect(400);

    await db.delete(users).where(eq(users.email, email));
  });

  it('PATCH /auth/password changes the password for the authenticated user', async () => {
    const email = `e2e-change-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Change User', email, password: 'supersecret1' })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/auth/password')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .send({ currentPassword: 'supersecret1', newPassword: 'brandnewpass1' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'brandnewpass1' })
      .expect(201);

    await db.delete(users).where(eq(users.email, email));
  });

  it('PATCH /auth/password returns 401 for an incorrect current password', async () => {
    const email = `e2e-change-wrong-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Change Wrong', email, password: 'supersecret1' })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/auth/password')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .send({ currentPassword: 'notmypassword', newPassword: 'brandnewpass1' })
      .expect(401);

    await db.delete(users).where(eq(users.email, email));
  });

  it('PATCH /auth/password returns 401 without an access token', async () => {
    await request(app.getHttpServer())
      .patch('/auth/password')
      .send({ currentPassword: 'a', newPassword: 'brandnewpass1' })
      .expect(401);
  });

  it('GET /professionals/me returns the authenticated professional profile', async () => {
    const email = `e2e-profile-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Profile User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/professionals/me')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .expect(200);

    expect(response.body.userId).toBeTruthy();
    expect(response.body.fullName).toBe('Profile User');

    await db.delete(users).where(eq(users.email, email));
  });

  it('GET /professionals/me returns 401 without an access token', async () => {
    await request(app.getHttpServer()).get('/professionals/me').expect(401);
  });

  it('GET /professionals/me returns 401 when given a refresh token', async () => {
    const email = `e2e-profile-refresh-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Refresh User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/professionals/me')
      .set('Authorization', `Bearer ${registerResponse.body.refreshToken}`)
      .expect(401);

    await db.delete(users).where(eq(users.email, email));
  });
  it('PATCH /professionals/me updates the authenticated professional profile', async () => {
    const email = `e2e-profile-update-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Profile Update User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const accessToken = registerResponse.body.accessToken;

    const response = await request(app.getHttpServer())
      .patch('/professionals/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fullName: 'Updated User',
        headline: 'Senior Software Engineer',
        bio: 'Builds reliable systems.',
        currentLocation: 'Bangalore',
        personalWebsite: 'https://example.com',
      })
      .expect(200);

    expect(response.body.fullName).toBe('Updated User');
    expect(response.body.headline).toBe('Senior Software Engineer');
    expect(response.body.bio).toBe('Builds reliable systems.');
    expect(response.body.currentLocation).toBe('Bangalore');
    expect(response.body.personalWebsite).toBe('https://example.com');

    await db.delete(users).where(eq(users.email, email));
  });

  it('PATCH /professionals/me performs a partial update', async () => {
    const email = `e2e-profile-partial-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Partial User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const accessToken = registerResponse.body.accessToken;

    await request(app.getHttpServer())
      .patch('/professionals/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        headline: 'Backend Engineer',
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/professionals/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.fullName).toBe('Partial User');
    expect(response.body.headline).toBe('Backend Engineer');

    await db.delete(users).where(eq(users.email, email));
  });

  it('PATCH /professionals/me returns 401 without an access token', async () => {
    await request(app.getHttpServer())
      .patch('/professionals/me')
      .send({
        headline: 'Should Fail',
      })
      .expect(401);
  });

  it('PATCH /professionals/me returns 400 for an invalid URL', async () => {
    const email = `e2e-profile-invalid-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Invalid URL User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch('/professionals/me')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .send({
        personalWebsite: 'not-a-url',
      })
      .expect(400);

    await db.delete(users).where(eq(users.email, email));
  });

  it('PATCH /professionals/me ignores server-controlled fields', async () => {
    const email = `e2e-profile-whitelist-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Whitelist User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const accessToken = registerResponse.body.accessToken;

    const response = await request(app.getHttpServer())
      .patch('/professionals/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        headline: 'Security Engineer',
        userId: 'attacker-user-id',
        id: 'attacker-profile-id',
        createdAt: '2000-01-01T00:00:00.000Z',
        updatedAt: '2000-01-01T00:00:00.000Z',
      })
      .expect(200);

    expect(response.body.headline).toBe('Security Engineer');
    expect(response.body.userId).not.toBe('attacker-user-id');
    expect(response.body.id).not.toBe('attacker-profile-id');

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/register treats a case-variant of an existing email as a duplicate', async () => {
    const email = `e2e-case-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Case User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Case Duplicate',
        email: email.toUpperCase(),
        password: 'supersecret1',
      })
      .expect(409);

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/login matches an account regardless of email casing used at login', async () => {
    const email = `e2e-case-login-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Case Login User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: email.toUpperCase(),
        password: 'supersecret1',
      })
      .expect(201);

    await db.delete(users).where(eq(users.email, email));
  });

  it('GET /companies/:id returns 400 (not 500) for a non-UUID id', async () => {
    const response = await request(app.getHttpServer()).get('/companies/not-a-uuid').expect(400);

    expect(response.body.statusCode).toBe(400);
  });

  it('GET /professionals/me returns 401 once the account has been suspended', async () => {
    const email = `e2e-suspend-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Suspend User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const accessToken = registerResponse.body.accessToken;

    await request(app.getHttpServer())
      .get('/professionals/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await db.update(users).set({ status: 'SUSPENDED' }).where(eq(users.email, email));

    // The access token issued before the suspension is still cryptographically
    // valid and unexpired -- AuthGuard must reject it anyway by checking the
    // account's current status on every request.
    await request(app.getHttpServer())
      .get('/professionals/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/refresh rejects a refresh token that has already been used', async () => {
    const email = `e2e-refresh-reuse-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Refresh Reuse User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const refreshToken = registerResponse.body.refreshToken;

    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(201);

    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(401);

    await db.delete(users).where(eq(users.email, email));
  });

  it('POST /auth/logout invalidates the current refresh token', async () => {
    const email = `e2e-logout-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Logout User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const { accessToken, refreshToken } = registerResponse.body;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken }).expect(401);

    await db.delete(users).where(eq(users.email, email));
  });

  it('GET /professionals/me rejects a valid email-verification token used as a bearer token', async () => {
    const email = `e2e-token-purpose-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Token Purpose User',
        email,
        password: 'supersecret1',
      })
      .expect(201);

    const verificationToken = registerResponse.body.devVerificationToken;

    await request(app.getHttpServer())
      .get('/professionals/me')
      .set('Authorization', `Bearer ${verificationToken}`)
      .expect(401);

    await db.delete(users).where(eq(users.email, email));
  });
});
