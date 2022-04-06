import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRatingsColumnForGame1649226568324
  implements MigrationInterface
{
  name = 'RemoveRatingsColumnForGame1649226568324';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rating\` DROP FOREIGN KEY \`FK_78a45f54bcd050be9097a0dba24\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` CHANGE \`gameId\` \`gameId\` int NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rating\` CHANGE \`gameId\` \`gameId\` int UNSIGNED NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD CONSTRAINT \`FK_78a45f54bcd050be9097a0dba24\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
