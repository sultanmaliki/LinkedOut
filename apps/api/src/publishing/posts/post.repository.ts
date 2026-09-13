import { and, eq, lte, or } from 'drizzle-orm';

import { db, posts, type NewPost } from '@linkedout/database';

export type PostRecord = typeof posts.$inferSelect;

export interface CreatePostData {
  professionalProfileId: string | null;
  companyId: string | null;
  content: string;
  visibility?: NewPost['visibility'];
  scheduledAt?: Date;
}

export class PostRepository {
  async create(data: CreatePostData): Promise<PostRecord> {
    const [post] = await db.insert(posts).values(data).returning();

    if (!post) {
      throw new Error('Failed to create post');
    }

    return post;
  }

  async findById(postId: string): Promise<PostRecord | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);

    return post;
  }

  async listVisible(): Promise<PostRecord[]> {
    const now = new Date();

    return db
      .select()
      .from(posts)
      .where(
        or(
          eq(posts.visibility, 'VISIBLE_NOW'),
          and(eq(posts.visibility, 'SCHEDULED'), lte(posts.scheduledAt, now)),
        ),
      );
  }

  async listByProfessional(professionalProfileId: string): Promise<PostRecord[]> {
    return db.select().from(posts).where(eq(posts.professionalProfileId, professionalProfileId));
  }

  async updateContent(postId: string, content: string): Promise<PostRecord | undefined> {
    const [post] = await db
      .update(posts)
      .set({ content, updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning();

    return post;
  }

  async archive(postId: string): Promise<PostRecord | undefined> {
    const [post] = await db
      .update(posts)
      .set({
        visibility: 'ARCHIVED',
        archivedAt: new Date(),
        archivedBefore: true,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning();

    return post;
  }

  async restore(postId: string): Promise<PostRecord | undefined> {
    const [post] = await db
      .update(posts)
      .set({ visibility: 'VISIBLE_NOW', archivedAt: null, updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning();

    return post;
  }

  async deleteById(postId: string): Promise<boolean> {
    const deleted = await db.delete(posts).where(eq(posts.id, postId)).returning({ id: posts.id });

    return deleted.length > 0;
  }
}
