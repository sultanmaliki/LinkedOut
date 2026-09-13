import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CompanyVerificationController } from '../company-verification.controller';
import { CompanyVerificationService } from '../company-verification.service';

describe('CompanyVerificationController', () => {
  let controller: CompanyVerificationController;

  const verificationService = {
    getVerification: jest.fn(),
    submitVerification: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyVerificationController],
      providers: [
        {
          provide: CompanyVerificationService,
          useValue: verificationService,
        },
      ],
    }).compile();

    controller = module.get<CompanyVerificationController>(CompanyVerificationController);
  });

  it('gets the verification record for the authenticated user', async () => {
    const verification = { companyId: 'company-1', verificationStatus: 'PENDING' };
    verificationService.getVerification.mockResolvedValue(verification);

    await expect(controller.getVerification('company-1', user)).resolves.toEqual(verification);
    expect(verificationService.getVerification).toHaveBeenCalledWith('company-1', 'user-1');
  });

  it('submits verification details for the authenticated user', async () => {
    const dto = { businessRegistrationNumber: 'REG-123' };
    const result = { companyId: 'company-1', ...dto };
    verificationService.submitVerification.mockResolvedValue(result);

    await expect(controller.submitVerification('company-1', user, dto)).resolves.toEqual(result);
    expect(verificationService.submitVerification).toHaveBeenCalledWith('company-1', 'user-1', dto);
  });
});
