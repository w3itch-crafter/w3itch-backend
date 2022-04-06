import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRatingColumnToGame1649225053190 implements MigrationInterface {
  name = 'AddRatingColumnToGame1649225053190';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_78a45f54bcd050be9097a0dba24\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` DROP FOREIGN KEY \`FK_d12253f0cbce01f030a9ced11d6\``,
    );
    await queryRunner.query(`ALTER TABLE \`game\` ADD \`rating\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_78a45f54bcd050be9097a0dba24\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` ADD CONSTRAINT \`FK_d12253f0cbce01f030a9ced11d6\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` DROP FOREIGN KEY \`FK_d12253f0cbce01f030a9ced11d6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_78a45f54bcd050be9097a0dba24\``,
    );
    await queryRunner.query(`ALTER TABLE \`game\` DROP COLUMN \`rating\``);
    await queryRunner.query(
      `ALTER TABLE \`game_tags_tag\` ADD CONSTRAINT \`FK_d12253f0cbce01f030a9ced11d6\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_78a45f54bcd050be9097a0dba24\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
