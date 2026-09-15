import { ContactService } from '../contact.service';

describe('ContactService', () => {
  const repository = {
    create: jest.fn(),
  };

  const service = new ContactService(repository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists a contact message and confirms receipt', async () => {
    repository.create.mockResolvedValue({ id: 'message-1' });

    const dto = {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I have a question about verifying my company.',
    };

    await expect(service.submit(dto)).resolves.toEqual({ received: true });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I have a question about verifying my company.',
    });
  });
});
