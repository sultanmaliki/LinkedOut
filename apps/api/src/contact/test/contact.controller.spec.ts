import { Test, TestingModule } from '@nestjs/testing';

import { ContactController } from '../contact.controller';
import { ContactService } from '../contact.service';

describe('ContactController', () => {
  let controller: ContactController;

  const contactService = {
    submit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: contactService }],
    }).compile();

    controller = module.get(ContactController);
  });

  it('submits a contact message', async () => {
    const dto = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I have a question about verifying my company.',
    };
    contactService.submit.mockResolvedValue({ received: true });

    await expect(controller.submit(dto)).resolves.toEqual({ received: true });
    expect(contactService.submit).toHaveBeenCalledWith(dto);
  });
});
