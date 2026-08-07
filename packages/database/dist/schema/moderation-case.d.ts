export declare const moderationCases: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'moderation_cases';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'moderation_cases';
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
    reporterId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'reporter_id';
        tableName: 'moderation_cases';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: false;
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
    targetType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'target_type';
        tableName: 'moderation_cases';
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
    targetId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'target_id';
        tableName: 'moderation_cases';
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
    reason: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'reason';
        tableName: 'moderation_cases';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data:
          | 'SPAM'
          | 'HARASSMENT'
          | 'FAKE_PROFILE'
          | 'FAKE_REVIEW'
          | 'MISLEADING_JOB'
          | 'IMPERSONATION'
          | 'POLICY_VIOLATION'
          | 'OTHER';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [
          'SPAM',
          'HARASSMENT',
          'FAKE_PROFILE',
          'FAKE_REVIEW',
          'MISLEADING_JOB',
          'IMPERSONATION',
          'POLICY_VIOLATION',
          'OTHER',
        ];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    description: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'description';
        tableName: 'moderation_cases';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
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
    status: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'status';
        tableName: 'moderation_cases';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'OPEN' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'DISMISSED';
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'DISMISSED'];
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
        tableName: 'moderation_cases';
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
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'moderation_cases';
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
export declare const moderationCasesRelations: import('drizzle-orm').Relations<
  'moderation_cases',
  {
    reporter: import('drizzle-orm').One<'users', false>;
  }
>;
export type ModerationCase = typeof moderationCases.$inferSelect;
export type NewModerationCase = typeof moderationCases.$inferInsert;
