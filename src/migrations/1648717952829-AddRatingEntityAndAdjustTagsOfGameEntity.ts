import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRatingEntityAndAdjustTagsOfGameEntity1648717952829
  implements MigrationInterface
{
  name = 'AddRatingEntityAndAdjustTagsOfGameEntity1648717952829';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`game_tags_tag\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` ADD PRIMARY KEY (\`gameId\`, \`tagId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` DROP COLUMN \`tagName\``,
    );
    await queryRunner.query(`ALTER TABLE \`tag\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`tag\` ADD \`id\` int UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`tag\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`tag\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tag\` CHANGE \`description\` \`description\` text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD UNIQUE INDEX \`IDX_da2419796cd8a0323f900fbc1c\` (\`gameName\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_d12253f0cbce01f030a9ced11d\` ON \`game_tags_tag\` (\`tagId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_78a45f54bcd050be9097a0dba24\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` ADD CONSTRAINT \`FK_d12253f0cbce01f030a9ced11d6\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` DROP FOREIGN KEY \`FK_d12253f0cbce01f030a9ced11d6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_78a45f54bcd050be9097a0dba24\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d12253f0cbce01f030a9ced11d\` ON \`game_tags_tag\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` DROP INDEX \`IDX_da2419796cd8a0323f900fbc1c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tag\` CHANGE \`description\` \`description\` text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`tag\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`tag\` ADD \`name\` text NOT NULL COMMENT 'Name of the tag'`,
    );
    await queryRunner.query(`ALTER TABLE \`tag\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`tag\` ADD \`id\` int UNSIGNED NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` ADD \`tagName\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`game_tags_tag\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` ADD PRIMARY KEY (\`gameId\`, \`tagId\`, \`tagName\`)`,
    );
  }
}
