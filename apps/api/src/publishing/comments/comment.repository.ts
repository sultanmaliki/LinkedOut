import { asc, eq } from 'drizzle-orm';

import { comments, db, type NewComment } from '@linkedout/database';

export type CommentRecord = typeof comments.$inferSelect;

export interface CreateCommentData {
  postId: string;
  professionalProfileId: string | null;
  companyId: string | null;
  parentCommentId: NewComment['parentCommentId'];
  content: string;
}

export class CommentRepository {
  async create(data: CreateCommentData): Promise<CommentRecord> {
    const [comment] = await db.insert(comments).values(data).returning();

    if (!comment) {
      throw new Error('Failed to create comment');
    }

    return comment;
  }

  async findById(commentId: string): Promise<CommentRecord | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);

    return comment;
  }

  async listByPost(postId: string): Promise<CommentRecord[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
  }

  async updateContent(commentId: string, content: string): Promise<CommentRecord | undefined> {
    const [comment] = await db
      .update(comments)
      .set({ content, edited: true, updatedAt: new Date() })
      .where(eq(comments.id, commentId))
      .returning();

    return comment;
  }

  async deleteById(commentId: string): Promise<boolean> {
    const deleted = await db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning({ id: comments.id });

    return deleted.length > 0;
  }
}
