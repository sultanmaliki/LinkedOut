export declare const companyAdmins: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'company_admins';
  schema: undefined;
  columns: {
    companyId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'company_id';
        tableName: 'company_admins';
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
    userId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'user_id';
        tableName: 'company_admins';
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
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'company_admins';
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
export declare const companyAdminsRelations: import('drizzle-orm').Relations<
  'company_admins',
  {
    company: import('drizzle-orm').One<'companies', true>;
    user: import('drizzle-orm').One<'users', true>;
  }
>;
export type CompanyAdmin = typeof companyAdmins.$inferSelect;
export type NewCompanyAdmin = typeof companyAdmins.$inferInsert;
