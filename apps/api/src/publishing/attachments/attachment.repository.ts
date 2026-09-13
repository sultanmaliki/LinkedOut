import { eq } from 'drizzle-orm';

import { attachments, db, type NewAttachment } from '@linkedout/database';

export type AttachmentRecord = typeof attachments.$inferSelect;

export type CreateAttachmentData = Omit<NewAttachment, 'id' | 'createdAt'>;

export class AttachmentRepository {
  async create(data: CreateAttachmentData): Promise<AttachmentRecord> {
    const [attachment] = await db.insert(attachments).values(data).returning();

    if (!attachment) {
      throw new Error('Failed to create attachment');
    }

    return attachment;
  }

  async findById(attachmentId: string): Promise<AttachmentRecord | undefined> {
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, attachmentId))
      .limit(1);

    return attachment;
  }

  async listByPost(postId: string): Promise<AttachmentRecord[]> {
    return db.select().from(attachments).where(eq(attachments.postId, postId));
  }

  async deleteById(attachmentId: string): Promise<boolean> {
    const deleted = await db
      .delete(attachments)
      .where(eq(attachments.id, attachmentId))
      .returning({ id: attachments.id });

    return deleted.length > 0;
  }
}
