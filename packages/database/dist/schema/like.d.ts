export declare const likes: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'likes';
  schema: undefined;
  columns: {
    postId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'post_id';
        tableName: 'likes';
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
    professionalProfileId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'professional_profile_id';
        tableName: 'likes';
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
    companyId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'company_id';
        tableName: 'likes';
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
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'likes';
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
export declare const likesRelations: import('drizzle-orm').Relations<
  'likes',
  {
    post: import('drizzle-orm').One<'posts', true>;
    professionalProfile: import('drizzle-orm').One<'professional_profiles', false>;
    company: import('drizzle-orm').One<'companies', false>;
  }
>;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
