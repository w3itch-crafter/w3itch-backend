import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterGameUsername1648805070442 implements MigrationInterface {
  name = 'AlterGameUsername1648805070442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game\` CHANGE \`userId\` \`username\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`game\` DROP COLUMN \`username\``);
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD \`username\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`game\` DROP COLUMN \`username\``);
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD \`username\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` CHANGE \`username\` \`userId\` int NOT NULL`,
    );
  }
}
