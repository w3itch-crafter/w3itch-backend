import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterGameDescLength1654651539899 implements MigrationInterface {
  name = 'AlterGameDescLength1654651539899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game\` 
MODIFY COLUMN \`description\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL AFTER \`genre\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`game\` 
MODIFY COLUMN \`description\` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL AFTER \`genre\``,
    );
  }
}
