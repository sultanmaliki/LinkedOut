import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Unauthenticated public form — the main spam/abuse vector on this route.
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post()
  async submit(@Body() dto: CreateContactMessageDto) {
    return this.contactService.submit(dto);
  }
}
