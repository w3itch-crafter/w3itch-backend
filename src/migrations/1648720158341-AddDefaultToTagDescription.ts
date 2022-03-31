import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultToTagDescription1648720158341
  implements MigrationInterface
{
  name = 'AddDefaultToTagDescription1648720158341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tag\` CHANGE \`description\` \`description\` text NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tag\` CHANGE \`description\` \`description\` text NOT NULL`,
    );
  }
}
