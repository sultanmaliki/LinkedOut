import { db, contactMessages } from '@linkedout/database';

export interface CreateContactMessageData {
  name: string;
  email: string;
  message: string;
}

export class ContactMessageRepository {
  async create(data: CreateContactMessageData): Promise<{ id: string }> {
    const [row] = await db
      .insert(contactMessages)
      .values(data)
      .returning({ id: contactMessages.id });

    if (!row) {
      throw new Error('Failed to create contact message');
    }

    return row;
  }
}
