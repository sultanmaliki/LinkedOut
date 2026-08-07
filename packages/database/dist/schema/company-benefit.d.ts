export declare const companyBenefits: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'company_benefits';
  schema: undefined;
  columns: {
    companyId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'company_id';
        tableName: 'company_benefits';
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
    benefitId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'benefit_id';
        tableName: 'company_benefits';
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
        tableName: 'company_benefits';
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
export declare const companyBenefitsRelations: import('drizzle-orm').Relations<
  'company_benefits',
  {
    company: import('drizzle-orm').One<'companies', true>;
    benefit: import('drizzle-orm').One<'benefits', true>;
  }
>;
export type CompanyBenefit = typeof companyBenefits.$inferSelect;
export type NewCompanyBenefit = typeof companyBenefits.$inferInsert;
