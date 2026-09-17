import { Injectable } from '@nestjs/common';

import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessageRepository } from './contact-message.repository';

@Injectable()
export class ContactService {
  constructor(private readonly contactMessageRepository: ContactMessageRepository) {}

  async submit(dto: CreateContactMessageDto): Promise<{ received: true }> {
    await this.contactMessageRepository.create({
      name: dto.name,
      email: dto.email,
      message: dto.message,
    });

    return { received: true };
  }
}
