"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("@linkedout/database");
const auth_service_1 = require("../auth.service");
const mailer_service_1 = require("../mailer.service");
const user_repository_1 = require("../user.repository");
const TEST_EMAIL = 'ada@example.com';
describe('AuthService', () => {
    beforeEach(async () => {
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
    });
    afterAll(async () => {
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
        await database_1.client.end();
    });
    it('registers a new user and persists the professional profile', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const result = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
        expect(result.user.email).toBe(TEST_EMAIL);
        expect(result.user.name).toBe('Ada');
        expect(result.user.role).toBe('PROFESSIONAL');
        const [user] = await database_1.db
            .select({
            id: database_1.users.id,
            email: database_1.users.email,
            role: database_1.users.role,
        })
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL))
            .limit(1);
        expect(user).toBeDefined();
        expect(user?.email).toBe(TEST_EMAIL);
        expect(user?.role).toBe('PROFESSIONAL');
        const [profile] = await database_1.db
            .select({
            userId: database_1.professionalProfiles.userId,
            fullName: database_1.professionalProfiles.fullName,
        })
            .from(database_1.professionalProfiles)
            .where((0, drizzle_orm_1.eq)(database_1.professionalProfiles.userId, user.id))
            .limit(1);
        expect(profile).toBeDefined();
        expect(profile?.userId).toBe(user.id);
        expect(profile?.fullName).toBe('Ada');
    });
    it('rejects invalid login credentials', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await expect(service.login({
            email: 'missing@example.com',
            password: 'wrongpass',
        })).rejects.toThrow('Invalid credentials');
    });
    it('logs in with valid persisted credentials', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const result = await service.login({
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        expect(result.user.email).toBe(TEST_EMAIL);
        expect(result.user.name).toBe('Ada');
        expect(result.user.role).toBe('PROFESSIONAL');
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
    });
    it('refreshes tokens with a valid refresh token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const result = await service.refresh({
            refreshToken: registered.refreshToken,
        });
        expect(result.user.email).toBe(TEST_EMAIL);
        expect(result.user.name).toBe('Ada');
        expect(result.user.role).toBe('PROFESSIONAL');
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
    });
    it('rejects duplicate registration', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await expect(service.register({
            name: 'Another Ada',
            email: TEST_EMAIL,
            password: 'anotherpassword',
        })).rejects.toThrow('Email already registered');
    });
    it('rejects an invalid refresh token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await expect(service.refresh({
            refreshToken: 'not-a-real-token',
        })).rejects.toThrow();
    });
    it('rejects a refresh token when the user no longer exists', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await database_1.db.delete(database_1.users).where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
        await expect(service.refresh({
            refreshToken: registered.refreshToken,
        })).rejects.toThrow('Invalid refresh token');
    });
    it.each(['DEACTIVATED', 'SUSPENDED', 'BANNED'])('rejects login for a %s account', async (status) => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await database_1.db
            .update(database_1.users)
            .set({
            status,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
        await expect(service.login({
            email: TEST_EMAIL,
            password: 'supersecret1',
        })).rejects.toThrow('Account is not active');
    });
    it('allows login for an active account', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await database_1.db
            .update(database_1.users)
            .set({
            status: 'ACTIVE',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
        const result = await service.login({
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        expect(result.user.email).toBe(TEST_EMAIL);
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
    });
    it('rejects refresh for a non-active account', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await database_1.db
            .update(database_1.users)
            .set({
            status: 'SUSPENDED',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
        await expect(service.refresh({
            refreshToken: registered.refreshToken,
        })).rejects.toThrow('Account is not active');
    });
    it('registers a new user as unverified and includes a dev verification token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const result = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        expect(result.user.emailVerified).toBe(false);
        expect(result.devVerificationToken).toBeTruthy();
    });
    it('verifies the email with a valid token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const verifyResult = await service.verifyEmail({ token: registered.devVerificationToken });
        expect(verifyResult.user.emailVerified).toBe(true);
        expect(verifyResult.accessToken).toBeTruthy();
        expect(verifyResult.refreshToken).toBeTruthy();
        const result = await service.login({
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        expect(result.user.emailVerified).toBe(true);
    });
    it('rejects an invalid verification token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await expect(service.verifyEmail({ token: 'not-a-real-token' })).rejects.toThrow('Invalid or expired verification link');
    });
    it('rejects a refresh token used as a verification token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await expect(service.verifyEmail({ token: registered.refreshToken })).rejects.toThrow('Invalid or expired verification link');
    });
    it('rejects verifying a token for a non-active account', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await database_1.db
            .update(database_1.users)
            .set({ status: 'SUSPENDED', updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(database_1.users.email, TEST_EMAIL));
        await expect(service.verifyEmail({ token: registered.devVerificationToken })).rejects.toThrow('Account is not active');
    });
    it('resends a verification email for an unverified user', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const result = await service.resendVerification(registered.user.id);
        expect(result.sent).toBe(true);
        expect(result.devVerificationToken).toBeTruthy();
    });
    it('rejects resending verification for an already-verified user', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await service.verifyEmail({ token: registered.devVerificationToken });
        await expect(service.resendVerification(registered.user.id)).rejects.toThrow('Email is already verified');
    });
    it('rejects replaying the same verification token after the account is already verified', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await expect(service.verifyEmail({ token: registered.devVerificationToken })).resolves.toMatchObject({ user: { emailVerified: true } });
        await expect(service.verifyEmail({ token: registered.devVerificationToken })).rejects.toThrow('Invalid or expired verification link');
    });
    it('rejects a refresh token once it has been replaced by a newer one', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const oldRefreshToken = registered.refreshToken;
        // Rotates activeRefreshTokenId to a new jti.
        await service.refresh({ refreshToken: oldRefreshToken });
        await expect(service.refresh({ refreshToken: oldRefreshToken })).rejects.toThrow('Invalid refresh token');
    });
    it('rejects a refresh token after logout', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await service.logout(registered.user.id);
        await expect(service.refresh({ refreshToken: registered.refreshToken })).rejects.toThrow('Invalid refresh token');
    });
    it('sends a password reset email and allows resetting with the returned token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const forgotResult = await service.forgotPassword({ email: TEST_EMAIL });
        expect(forgotResult.sent).toBe(true);
        expect(forgotResult.devResetToken).toBeTruthy();
        const resetResult = await service.resetPassword({
            token: forgotResult.devResetToken,
            newPassword: 'brandnewpass1',
        });
        expect(resetResult.user.email).toBe(TEST_EMAIL);
        expect(resetResult.accessToken).toBeTruthy();
        expect(resetResult.refreshToken).toBeTruthy();
        // Old password no longer works, new one does.
        await expect(service.login({ email: TEST_EMAIL, password: 'supersecret1' })).rejects.toThrow('Invalid credentials');
        const loginResult = await service.login({ email: TEST_EMAIL, password: 'brandnewpass1' });
        expect(loginResult.user.email).toBe(TEST_EMAIL);
    });
    it('returns the same generic response for forgotPassword whether or not the email is registered', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await expect(service.forgotPassword({ email: 'never-registered@example.com' })).resolves.toEqual({ sent: true });
    });
    it('rejects an invalid password reset token', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await expect(service.resetPassword({ token: 'not-a-real-token', newPassword: 'brandnewpass1' })).rejects.toThrow('Invalid or expired reset link');
    });
    it('rejects replaying a password reset token after it has already been used', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const forgotResult = await service.forgotPassword({ email: TEST_EMAIL });
        await service.resetPassword({
            token: forgotResult.devResetToken,
            newPassword: 'brandnewpass1',
        });
        await expect(service.resetPassword({ token: forgotResult.devResetToken, newPassword: 'anotherpass1' })).rejects.toThrow('Invalid or expired reset link');
    });
    it('rejects a password reset token superseded by a newer request', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const firstRequest = await service.forgotPassword({ email: TEST_EMAIL });
        await service.forgotPassword({ email: TEST_EMAIL }); // supersedes the first
        await expect(service.resetPassword({ token: firstRequest.devResetToken, newPassword: 'brandnewpass1' })).rejects.toThrow('Invalid or expired reset link');
    });
    it('changes the password for the authenticated user given the correct current password', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        const result = await service.changePassword(registered.user.id, {
            currentPassword: 'supersecret1',
            newPassword: 'brandnewpass1',
        });
        expect(result.accessToken).toBeTruthy();
        expect(result.refreshToken).toBeTruthy();
        await expect(service.login({ email: TEST_EMAIL, password: 'supersecret1' })).rejects.toThrow('Invalid credentials');
        await expect(service.login({ email: TEST_EMAIL, password: 'brandnewpass1' })).resolves.toMatchObject({ user: { email: TEST_EMAIL } });
    });
    it('rejects changing the password with an incorrect current password', async () => {
        const repository = new user_repository_1.UserRepository();
        const service = new auth_service_1.AuthService(repository, new mailer_service_1.MailerService());
        const registered = await service.register({
            name: 'Ada',
            email: TEST_EMAIL,
            password: 'supersecret1',
        });
        await expect(service.changePassword(registered.user.id, {
            currentPassword: 'wrongpassword',
            newPassword: 'brandnewpass1',
        })).rejects.toThrow('Current password is incorrect');
    });
});
