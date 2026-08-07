export declare const professionalSnapshots: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'professional_snapshots';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'professional_snapshots';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
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
    reviewId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'review_id';
        tableName: 'professional_snapshots';
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
    snapshot: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'snapshot';
        tableName: 'professional_snapshots';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
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
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'professional_snapshots';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
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
export declare const professionalSnapshotsRelations: import('drizzle-orm').Relations<
  'professional_snapshots',
  {
    review: import('drizzle-orm').One<'reviews', true>;
  }
>;
export type ProfessionalSnapshot = typeof professionalSnapshots.$inferSelect;
export type NewProfessionalSnapshot = typeof professionalSnapshots.$inferInsert;
