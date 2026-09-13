import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { EmploymentVerificationController } from '../employment-verification.controller';
import { EmploymentVerificationService } from '../employment-verification.service';

describe('EmploymentVerificationController', () => {
  let controller: EmploymentVerificationController;

  const verificationService = {
    getVerification: jest.fn(),
    submitVerification: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmploymentVerificationController],
      providers: [{ provide: EmploymentVerificationService, useValue: verificationService }],
    }).compile();

    controller = module.get<EmploymentVerificationController>(EmploymentVerificationController);
  });

  it('gets the verification record for the authenticated user', async () => {
    const verification = { employmentHistoryId: 'history-1', verificationStatus: 'PENDING' };
    verificationService.getVerification.mockResolvedValue(verification);

    await expect(controller.getVerification('history-1', user)).resolves.toEqual(verification);
    expect(verificationService.getVerification).toHaveBeenCalledWith('user-1', 'history-1');
  });

  it('submits verification details for the authenticated user', async () => {
    const dto = { companyEmail: 'ada@acme.com' };
    const result = { employmentHistoryId: 'history-1', ...dto };
    verificationService.submitVerification.mockResolvedValue(result);

    await expect(controller.submitVerification('history-1', user, dto)).resolves.toEqual(result);
    expect(verificationService.submitVerification).toHaveBeenCalledWith('user-1', 'history-1', dto);
  });
});
