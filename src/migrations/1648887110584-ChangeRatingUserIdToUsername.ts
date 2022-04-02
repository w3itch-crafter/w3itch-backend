import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeRatingUserIdToUsername1648887110584
  implements MigrationInterface
{
  name = 'ChangeRatingUserIdToUsername1648887110584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rating\` CHANGE \`userId\` \`username\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`username\``);
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD \`username\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD UNIQUE INDEX \`IDX_da2419796cd8a0323f900fbc1c\` (\`gameName\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` CHANGE \`file\` \`file\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`username\` \`username\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`username\` \`username\` varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` CHANGE \`file\` \`file\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` DROP INDEX \`IDX_da2419796cd8a0323f900fbc1c\``,
    );
    await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`username\``);
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD \`username\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` CHANGE \`username\` \`userId\` int NOT NULL`,
    );
  }
}
