import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeChainNameTypeToString1649655261743
  implements MigrationInterface
{
  name = 'ChangeChainNameTypeToString1649655261743';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`token\` DROP COLUMN \`chainName\``);
    await queryRunner.query(
      `ALTER TABLE \`token\` ADD \`chainName\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`token\` DROP COLUMN \`chainName\``);
    await queryRunner.query(
      `ALTER TABLE \`token\` ADD \`chainName\` int NOT NULL`,
    );
  }
}
