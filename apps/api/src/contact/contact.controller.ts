import { Body, Controller, Post } from '@nestjs/common';

import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submit(@Body() dto: CreateContactMessageDto) {
    return this.contactService.submit(dto);
  }
}
