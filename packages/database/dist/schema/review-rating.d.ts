export declare const reviewRatings: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'review_ratings';
  schema: undefined;
  columns: {
    reviewId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'review_id';
        tableName: 'review_ratings';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    category: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'category';
        tableName: 'review_ratings';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    score: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'score';
        tableName: 'review_ratings';
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const reviewRatingsRelations: import('drizzle-orm').Relations<
  'review_ratings',
  {
    review: import('drizzle-orm').One<'reviews', true>;
  }
>;
export type ReviewRating = typeof reviewRatings.$inferSelect;
export type NewReviewRating = typeof reviewRatings.$inferInsert;
