export declare const employmentHistories: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'employment_histories';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'employment_histories';
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
    professionalProfileId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'professional_profile_id';
        tableName: 'employment_histories';
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
    companyName: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'company_name';
        tableName: 'employment_histories';
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
    jobTitle: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'job_title';
        tableName: 'employment_histories';
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
    employmentType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'employment_type';
        tableName: 'employment_histories';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data:
          'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [
          'FULL_TIME',
          'PART_TIME',
          'CONTRACT',
          'FREELANCE',
          'INTERNSHIP',
          'APPRENTICESHIP',
        ];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    workMode: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'work_mode';
        tableName: 'employment_histories';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'ONSITE' | 'HYBRID' | 'REMOTE';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['ONSITE', 'HYBRID', 'REMOTE'];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    location: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'location';
        tableName: 'employment_histories';
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
    description: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'description';
        tableName: 'employment_histories';
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
    startDate: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'start_date';
        tableName: 'employment_histories';
        dataType: 'string';
        columnType: 'PgDateString';
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
    endDate: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'end_date';
        tableName: 'employment_histories';
        dataType: 'string';
        columnType: 'PgDateString';
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
    currentlyWorking: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'currently_working';
        tableName: 'employment_histories';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
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
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'employment_histories';
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
        tableName: 'employment_histories';
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
export declare const employmentHistoriesRelations: import('drizzle-orm').Relations<
  'employment_histories',
  {
    professionalProfile: import('drizzle-orm').One<'professional_profiles', true>;
  }
>;
export type EmploymentHistory = typeof employmentHistories.$inferSelect;
export type NewEmploymentHistory = typeof employmentHistories.$inferInsert;
