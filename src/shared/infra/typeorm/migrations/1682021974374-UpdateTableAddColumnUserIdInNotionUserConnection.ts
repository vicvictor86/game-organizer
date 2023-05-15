import {
  MigrationInterface, QueryRunner, TableColumn, TableForeignKey,
} from 'typeorm';

export class UpdateTableAddColumnUserIdInNotionUserConnection1682021974374 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn('users', 'id', new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }));

    await queryRunner.changeColumn('notion_user_connection', 'id', new TableColumn({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }));

    await queryRunner.addColumn('notion_user_connection', new TableColumn({
      name: 'user_id',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.createForeignKey('notion_user_connection', new TableForeignKey({
      name: 'UserIdConnection',
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('notion_user_connection', 'UserIdConnection');
    await queryRunner.dropColumn('notion_user_connection', 'user_id');

    await queryRunner.changeColumn('users', 'id', new TableColumn({
      name: 'id',
      type: 'varchar',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }));

    await queryRunner.changeColumn('notion_user_connection', 'id', new TableColumn({
      name: 'id',
      type: 'varchar',
      isPrimary: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    }));
  }
}
