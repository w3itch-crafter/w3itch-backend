import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPriceAmountToString1649833411291
  implements MigrationInterface
{
  name = 'AlterPriceAmountToString1649833411291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`price\` DROP COLUMN \`amount\``);
    await queryRunner.query(
      `ALTER TABLE \`price\` ADD \`amount\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`price\` DROP COLUMN \`amount\``);
    await queryRunner.query(
      `ALTER TABLE \`price\` ADD \`amount\` decimal NOT NULL`,
    );
  }
}
