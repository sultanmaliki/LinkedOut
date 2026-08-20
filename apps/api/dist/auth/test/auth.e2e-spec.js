"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@linkedout/database");
const app_module_1 = require("../../app.module");
describe('Auth HTTP (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
        }));
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
        expect(response.body.message).toEqual(expect.arrayContaining([
            expect.stringContaining('name'),
            expect.stringContaining('email'),
            expect.stringContaining('password'),
        ]));
    });
    it('POST /auth/refresh returns 400 when refreshToken is missing', async () => {
        await (0, supertest_1.default)(app.getHttpServer()).post('/auth/refresh').send({}).expect(400);
    });
    it('GET /professionals/me returns the authenticated professional profile', async () => {
        const email = `e2e-profile-${Date.now()}@example.com`;
        const registerResponse = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            name: 'Profile User',
            email,
            password: 'supersecret1',
        })
            .expect(201);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get('/professionals/me')
            .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
            .expect(200);
        expect(response.body.userId).toBeTruthy();
        expect(response.body.fullName).toBe('Profile User');
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, email));
    });
    it('GET /professionals/me returns 401 without an access token', async () => {
        await (0, supertest_1.default)(app.getHttpServer()).get('/professionals/me').expect(401);
    });
    it('GET /professionals/me returns 401 when given a refresh token', async () => {
        const email = `e2e-profile-refresh-${Date.now()}@example.com`;
        const registerResponse = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            name: 'Refresh User',
            email,
            password: 'supersecret1',
        })
            .expect(201);
        await (0, supertest_1.default)(app.getHttpServer())
            .get('/professionals/me')
            .set('Authorization', `Bearer ${registerResponse.body.refreshToken}`)
            .expect(401);
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, email));
    });
    it('PATCH /professionals/me updates the authenticated professional profile', async () => {
        const email = `e2e-profile-update-${Date.now()}@example.com`;
        const registerResponse = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            name: 'Profile Update User',
            email,
            password: 'supersecret1',
        })
            .expect(201);
        const accessToken = registerResponse.body.accessToken;
        const response = await (0, supertest_1.default)(app.getHttpServer())
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
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, email));
    });
    it('PATCH /professionals/me performs a partial update', async () => {
        const email = `e2e-profile-partial-${Date.now()}@example.com`;
        const registerResponse = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            name: 'Partial User',
            email,
            password: 'supersecret1',
        })
            .expect(201);
        const accessToken = registerResponse.body.accessToken;
        await (0, supertest_1.default)(app.getHttpServer())
            .patch('/professionals/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
            headline: 'Backend Engineer',
        })
            .expect(200);
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .get('/professionals/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        expect(response.body.fullName).toBe('Partial User');
        expect(response.body.headline).toBe('Backend Engineer');
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, email));
    });
    it('PATCH /professionals/me returns 401 without an access token', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .patch('/professionals/me')
            .send({
            headline: 'Should Fail',
        })
            .expect(401);
    });
    it('PATCH /professionals/me returns 400 for an invalid URL', async () => {
        const email = `e2e-profile-invalid-${Date.now()}@example.com`;
        const registerResponse = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            name: 'Invalid URL User',
            email,
            password: 'supersecret1',
        })
            .expect(201);
        await (0, supertest_1.default)(app.getHttpServer())
            .patch('/professionals/me')
            .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
            .send({
            personalWebsite: 'not-a-url',
        })
            .expect(400);
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, email));
    });
    it('PATCH /professionals/me ignores server-controlled fields', async () => {
        const email = `e2e-profile-whitelist-${Date.now()}@example.com`;
        const registerResponse = await (0, supertest_1.default)(app.getHttpServer())
            .post('/auth/register')
            .send({
            name: 'Whitelist User',
            email,
            password: 'supersecret1',
        })
            .expect(201);
        const accessToken = registerResponse.body.accessToken;
        const response = await (0, supertest_1.default)(app.getHttpServer())
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
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, email));
    });
});
