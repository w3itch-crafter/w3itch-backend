import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitRatingAlterTag1648803240365 implements MigrationInterface {
  name = 'InitRatingAlterTag1648803240365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`rating\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, \`rating\` int NOT NULL, \`gameId\` int UNSIGNED NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tag\` CHANGE \`description\` \`description\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_78a45f54bcd050be9097a0dba24\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_78a45f54bcd050be9097a0dba24\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tag\` CHANGE \`description\` \`description\` text NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE \`rating\``);
  }
}
