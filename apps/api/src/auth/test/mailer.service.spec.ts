import { Logger } from '@nestjs/common';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

import { MailerService } from '../mailer.service';

describe('MailerService', () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalWebOrigin = process.env.WEB_ORIGIN;

  afterEach(() => {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.WEB_ORIGIN = originalWebOrigin;
    sendMock.mockReset();
  });

  it('logs the verification link instead of sending when RESEND_API_KEY is unset', async () => {
    delete process.env.RESEND_API_KEY;
    process.env.WEB_ORIGIN = 'http://localhost:3000';

    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    const service = new MailerService();
    await service.sendVerificationEmail('ada@example.com', 'tok123');

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:3000/verify-email?token=tok123'),
    );
    expect(sendMock).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('sends via Resend when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.WEB_ORIGIN = 'https://linkedout.example';
    sendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    const service = new MailerService();
    await service.sendVerificationEmail('ada@example.com', 'tok123');

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ada@example.com',
        html: expect.stringContaining('https://linkedout.example/verify-email?token=tok123'),
      }),
    );
  });

  it('logs an error but does not throw when Resend returns an error', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const service = new MailerService();
    await expect(
      service.sendVerificationEmail('ada@example.com', 'tok123'),
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('boom'));

    errorSpy.mockRestore();
  });
});
