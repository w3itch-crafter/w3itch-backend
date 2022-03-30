import {MigrationInterface, QueryRunner} from "typeorm";

export class AlertGameAddDescription1648627710936 implements MigrationInterface {
    name = 'AlertGameAddDescription1648627710936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`game\` ADD \`description\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`game\` DROP COLUMN \`description\``);
    }

}
