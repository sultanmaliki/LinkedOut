export declare const employmentExpectations: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'employment_expectations';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'employment_expectations';
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
        tableName: 'employment_expectations';
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
    desiredJobTitle: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'desired_job_title';
        tableName: 'employment_expectations';
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
        tableName: 'employment_expectations';
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
        tableName: 'employment_expectations';
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
    expectedSalaryMin: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'expected_salary_min';
        tableName: 'employment_expectations';
        dataType: 'number';
        columnType: 'PgBigInt53';
        data: number;
        driverParam: string | number;
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
    expectedSalaryMax: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'expected_salary_max';
        tableName: 'employment_expectations';
        dataType: 'number';
        columnType: 'PgBigInt53';
        data: number;
        driverParam: string | number;
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
    currency: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'currency';
        tableName: 'employment_expectations';
        dataType: 'string';
        columnType: 'PgChar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 3;
      }
    >;
    noticePeriod: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'notice_period';
        tableName: 'employment_expectations';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data:
          | 'IMMEDIATE'
          | '7_DAYS'
          | '15_DAYS'
          | '30_DAYS'
          | '45_DAYS'
          | '60_DAYS'
          | '90_DAYS'
          | 'NEGOTIABLE';
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [
          'IMMEDIATE',
          '7_DAYS',
          '15_DAYS',
          '30_DAYS',
          '45_DAYS',
          '60_DAYS',
          '90_DAYS',
          'NEGOTIABLE',
        ];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    openToRelocation: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'open_to_relocation';
        tableName: 'employment_expectations';
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
    activelyLooking: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'actively_looking';
        tableName: 'employment_expectations';
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
        tableName: 'employment_expectations';
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
        tableName: 'employment_expectations';
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
export declare const employmentExpectationsRelations: import('drizzle-orm').Relations<
  'employment_expectations',
  {
    professionalProfile: import('drizzle-orm').One<'professional_profiles', true>;
  }
>;
export type EmploymentExpectation = typeof employmentExpectations.$inferSelect;
export type NewEmploymentExpectation = typeof employmentExpectations.$inferInsert;
