import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceAndTokenEntities1649650434777
  implements MigrationInterface
{
  name = 'AddPriceAndTokenEntities1649650434777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`FK_78a45f54bcd050be9097a0dba24\` ON \`rating\``,
    );
    await queryRunner.query(
      `CREATE TABLE \`token\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`address\` varchar(255) NOT NULL, \`symbol\` varchar(255) NOT NULL, \`chainId\` int NOT NULL, \`chainName\` int NOT NULL, PRIMARY KEY (\`id\`, \`address\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`price\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`chainId\` int NOT NULL, \`amount\` decimal NOT NULL, \`gameId\` int UNSIGNED NULL, \`token_address\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`, \`chainId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`game\` DROP COLUMN \`tokenId\``);
    await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`rating\``);
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD \`rating\` decimal NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`price\` ADD CONSTRAINT \`FK_0f7d44f60de0aa336171ef85474\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`price\` DROP FOREIGN KEY \`FK_0f7d44f60de0aa336171ef85474\``,
    );
    await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`rating\``);
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD \`rating\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD \`tokenId\` int NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE \`price\``);
    await queryRunner.query(`DROP TABLE \`token\``);
    await queryRunner.query(
      `CREATE INDEX \`FK_78a45f54bcd050be9097a0dba24\` ON \`rating\` (\`gameId\`)`,
    );
  }
}
