import { and, eq } from 'drizzle-orm';

import { db, portfolioLinks, type NewPortfolioLink } from '@linkedout/database';

export type PortfolioLinkRecord = typeof portfolioLinks.$inferSelect;

export type CreatePortfolioLinkData = Omit<
  NewPortfolioLink,
  'id' | 'professionalProfileId' | 'createdAt'
>;

export type UpdatePortfolioLinkData = Partial<CreatePortfolioLinkData>;

export class PortfolioLinkRepository {
  async create(
    professionalProfileId: string,
    data: CreatePortfolioLinkData,
  ): Promise<PortfolioLinkRecord> {
    const [link] = await db
      .insert(portfolioLinks)
      .values({
        professionalProfileId,
        ...data,
      })
      .returning();

    if (!link) {
      throw new Error('Failed to create portfolio link');
    }

    return link;
  }

  async listByProfile(professionalProfileId: string): Promise<PortfolioLinkRecord[]> {
    return db
      .select()
      .from(portfolioLinks)
      .where(eq(portfolioLinks.professionalProfileId, professionalProfileId));
  }

  async findById(
    professionalProfileId: string,
    linkId: string,
  ): Promise<PortfolioLinkRecord | undefined> {
    const [link] = await db
      .select()
      .from(portfolioLinks)
      .where(
        and(
          eq(portfolioLinks.professionalProfileId, professionalProfileId),
          eq(portfolioLinks.id, linkId),
        ),
      )
      .limit(1);

    return link;
  }

  async updateById(
    professionalProfileId: string,
    linkId: string,
    data: UpdatePortfolioLinkData,
  ): Promise<PortfolioLinkRecord | undefined> {
    const [link] = await db
      .update(portfolioLinks)
      .set(data)
      .where(
        and(
          eq(portfolioLinks.professionalProfileId, professionalProfileId),
          eq(portfolioLinks.id, linkId),
        ),
      )
      .returning();

    return link;
  }

  async deleteById(professionalProfileId: string, linkId: string): Promise<boolean> {
    const deleted = await db
      .delete(portfolioLinks)
      .where(
        and(
          eq(portfolioLinks.professionalProfileId, professionalProfileId),
          eq(portfolioLinks.id, linkId),
        ),
      )
      .returning({ id: portfolioLinks.id });

    return deleted.length > 0;
  }
}
