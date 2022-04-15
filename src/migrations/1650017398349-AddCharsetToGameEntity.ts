import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCharsetToGameEntity1650017398349 implements MigrationInterface {
  name = 'AddCharsetToGameEntity1650017398349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD \`charset\` varchar(255) NOT NULL DEFAULT 'UTF8'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`game\` DROP COLUMN \`charset\``);
  }
}
