import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateNotionUserConnection1681852084865 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'notion_user_connection',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'access_token',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'bot_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'duplicate_template_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'owner_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'workspace_icon',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'workspace_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'workspace_name',
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
                ]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('notion_user_connection');
    }

}
