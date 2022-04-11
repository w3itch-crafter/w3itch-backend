import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdjustTokenColumnInPrice1649651681642
  implements MigrationInterface
{
  name = 'AdjustTokenColumnInPrice1649651681642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`FK_78a45f54bcd050be9097a0dba24\` ON \`rating\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`price\` DROP COLUMN \`token_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`price\` ADD \`tokenId\` int UNSIGNED NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`price\` ADD \`tokenAddress\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`price\` ADD CONSTRAINT \`FK_11e8c58408e574aa9204f768f7e\` FOREIGN KEY (\`tokenId\`, \`tokenAddress\`) REFERENCES \`token\`(\`id\`,\`address\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`price\` DROP FOREIGN KEY \`FK_11e8c58408e574aa9204f768f7e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`price\` DROP COLUMN \`tokenAddress\``,
    );
    await queryRunner.query(`ALTER TABLE \`price\` DROP COLUMN \`tokenId\``);
    await queryRunner.query(
      `ALTER TABLE \`price\` ADD \`token_address\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_78a45f54bcd050be9097a0dba24\` ON \`rating\` (\`gameId\`)`,
    );
  }
}
