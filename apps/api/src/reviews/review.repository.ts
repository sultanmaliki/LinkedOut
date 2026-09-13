import { eq } from 'drizzle-orm';

import {
  db,
  employmentHistories,
  professionalSnapshots,
  reviewRatings,
  reviews,
  reviewSnapshots,
  type NewReview,
} from '@linkedout/database';

export type ReviewRecord = typeof reviews.$inferSelect;

export interface ReviewRatingInput {
  category: string;
  score: number;
}

export interface ReviewWithRatings extends ReviewRecord {
  ratings: ReviewRatingInput[];
}

export interface CreateReviewData {
  companyId: string;
  employmentHistoryId: string;
  title: string;
  review: string;
  anonymous?: boolean;
  recommended?: boolean;
  ratings: ReviewRatingInput[];
}

export interface ReviewSnapshotData {
  company: Record<string, unknown>;
  professional: Record<string, unknown>;
}

export type UpdateReviewData = Partial<
  Pick<NewReview, 'title' | 'review' | 'recommended' | 'anonymous'>
>;

export class ReviewRepository {
  async existsForEmploymentHistory(employmentHistoryId: string): Promise<boolean> {
    const [row] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.employmentHistoryId, employmentHistoryId))
      .limit(1);

    return Boolean(row);
  }

  async findOwnerProfileId(reviewId: string): Promise<string | undefined> {
    const [row] = await db
      .select({ professionalProfileId: employmentHistories.professionalProfileId })
      .from(reviews)
      .innerJoin(employmentHistories, eq(employmentHistories.id, reviews.employmentHistoryId))
      .where(eq(reviews.id, reviewId))
      .limit(1);

    return row?.professionalProfileId;
  }

  async create(
    data: CreateReviewData,
    snapshotData: ReviewSnapshotData,
  ): Promise<ReviewWithRatings> {
    return db.transaction(async (tx) => {
      const [review] = await tx
        .insert(reviews)
        .values({
          companyId: data.companyId,
          employmentHistoryId: data.employmentHistoryId,
          title: data.title,
          review: data.review,
          anonymous: data.anonymous,
          recommended: data.recommended,
        })
        .returning();

      if (!review) {
        throw new Error('Failed to create review');
      }

      if (data.ratings.length > 0) {
        await tx.insert(reviewRatings).values(
          data.ratings.map((rating) => ({
            reviewId: review.id,
            category: rating.category,
            score: rating.score,
          })),
        );
      }

      await tx.insert(reviewSnapshots).values({
        reviewId: review.id,
        snapshot: snapshotData.company,
      });

      await tx.insert(professionalSnapshots).values({
        reviewId: review.id,
        snapshot: snapshotData.professional,
      });

      return { ...review, ratings: data.ratings };
    });
  }

  async findById(reviewId: string): Promise<ReviewWithRatings | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);

    if (!review) {
      return undefined;
    }

    const ratings = await this.getRatings(reviewId);

    return { ...review, ratings };
  }

  async listByCompany(companyId: string): Promise<ReviewWithRatings[]> {
    const rows = await db.select().from(reviews).where(eq(reviews.companyId, companyId));

    const results: ReviewWithRatings[] = [];

    for (const row of rows) {
      const ratings = await this.getRatings(row.id);
      results.push({ ...row, ratings });
    }

    return results;
  }

  async updateById(
    reviewId: string,
    data: UpdateReviewData,
    ratings?: ReviewRatingInput[],
  ): Promise<ReviewWithRatings | undefined> {
    return db.transaction(async (tx) => {
      const [review] = await tx
        .update(reviews)
        .set({
          ...data,
          edited: true,
          lastEditedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, reviewId))
        .returning();

      if (!review) {
        return undefined;
      }

      if (ratings) {
        await tx.delete(reviewRatings).where(eq(reviewRatings.reviewId, reviewId));

        if (ratings.length > 0) {
          await tx.insert(reviewRatings).values(
            ratings.map((rating) => ({
              reviewId,
              category: rating.category,
              score: rating.score,
            })),
          );
        }
      }

      const currentRatings = await tx
        .select({ category: reviewRatings.category, score: reviewRatings.score })
        .from(reviewRatings)
        .where(eq(reviewRatings.reviewId, reviewId));

      return { ...review, ratings: currentRatings };
    });
  }

  async deleteById(reviewId: string): Promise<boolean> {
    const deleted = await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning({ id: reviews.id });

    return deleted.length > 0;
  }

  private async getRatings(reviewId: string): Promise<ReviewRatingInput[]> {
    return db
      .select({ category: reviewRatings.category, score: reviewRatings.score })
      .from(reviewRatings)
      .where(eq(reviewRatings.reviewId, reviewId));
  }
}
