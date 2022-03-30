import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitGameAndTag1648622440670 implements MigrationInterface {
  name = 'InitGameAndTag1648622440670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tag\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` text NOT NULL COMMENT 'Name of the tag', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`game\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, \`title\` varchar(255) NOT NULL, \`paymentMode\` varchar(255) NOT NULL DEFAULT 'FREE', \`subtitle\` varchar(255) NOT NULL, \`gameName\` varchar(255) NOT NULL, \`file\` varchar(255) NOT NULL, \`classification\` varchar(255) NOT NULL DEFAULT 'GAMES', \`kind\` varchar(255) NOT NULL COMMENT 'Kind of the project (game engine)' DEFAULT 'rm2k3e', \`releaseStatus\` varchar(255) NOT NULL, \`screenshots\` text NOT NULL COMMENT 'Game screenshots', \`cover\` varchar(255) NOT NULL, \`tokenId\` int NOT NULL, \`appStoreLinks\` text NOT NULL, \`community\` varchar(255) NOT NULL DEFAULT 'DISQUS', \`genre\` varchar(255) NOT NULL DEFAULT 'NO_GENRE', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`game_tags_tag\` (\`gameId\` int UNSIGNED NOT NULL, \`tagId\` int UNSIGNED NOT NULL, INDEX \`IDX_6366e7093c3571f85f1b5ffd4f\` (\`gameId\`), INDEX \`IDX_d12253f0cbce01f030a9ced11d\` (\`tagId\`), PRIMARY KEY (\`gameId\`, \`tagId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` ADD CONSTRAINT \`FK_6366e7093c3571f85f1b5ffd4f1\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
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
      `ALTER TABLE \`game_tags_tag\` DROP FOREIGN KEY \`FK_6366e7093c3571f85f1b5ffd4f1\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d12253f0cbce01f030a9ced11d\` ON \`game_tags_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_6366e7093c3571f85f1b5ffd4f\` ON \`game_tags_tag\``,
    );
    await queryRunner.query(`DROP TABLE \`game_tags_tag\``);
    await queryRunner.query(`DROP TABLE \`game\``);
    await queryRunner.query(`DROP TABLE \`tag\``);
  }
}
