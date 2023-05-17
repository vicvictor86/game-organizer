import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateTableNotionUserConnection1684344982526 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('notion_user_connection', 'platform_database_id');

    await queryRunner.dropColumn('notion_user_connection', 'game_database_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('notion_user_connection', [
      new TableColumn({
        name: 'game_database_id',
        type: 'varchar',
        isNullable: false,
      }),
      new TableColumn({
        name: 'platform_database_id',
        type: 'varchar',
        isNullable: false,
      }),
    ]);
  }
}
