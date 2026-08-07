export declare const contactMethods: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'contact_methods';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'contact_methods';
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
    professionalResponseId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'professional_response_id';
        tableName: 'contact_methods';
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
    type: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'type';
        tableName: 'contact_methods';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'EMAIL' | 'PHONE' | 'LINKEDIN' | 'PORTFOLIO';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['EMAIL', 'PHONE', 'LINKEDIN', 'PORTFOLIO'];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    value: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'value';
        tableName: 'contact_methods';
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
    sharedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'shared_at';
        tableName: 'contact_methods';
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
    expiresAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'expires_at';
        tableName: 'contact_methods';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
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
    deletedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'deleted_at';
        tableName: 'contact_methods';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
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
        tableName: 'contact_methods';
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
        tableName: 'contact_methods';
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
export declare const contactMethodsRelations: import('drizzle-orm').Relations<
  'contact_methods',
  {
    professionalResponse: import('drizzle-orm').One<'professional_responses', true>;
  }
>;
export type ContactMethod = typeof contactMethods.$inferSelect;
export type NewContactMethod = typeof contactMethods.$inferInsert;
