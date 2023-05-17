import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotionTablePagesAndDatabases1684342992307 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notion_table_pages_and_databases',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'owner_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'page_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'game_database_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'platform_database_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'UserConfigUser',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            columnNames: ['user_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notion_table_pages_and_databases');
  }
}
