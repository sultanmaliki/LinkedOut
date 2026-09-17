import { Module } from '@nestjs/common';

import { ContactController } from './contact.controller';
import { ContactMessageRepository } from './contact-message.repository';
import { ContactService } from './contact.service';

@Module({
  controllers: [ContactController],
  providers: [ContactService, ContactMessageRepository],
})
export class ContactModule {}
