import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccessTypeToGameEntity1656915336284
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD \`accessType\` varchar(255) NOT NULL DEFAULT 'PUBLIC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`game\` DROP COLUMN \`accessType\``);
  }
}
