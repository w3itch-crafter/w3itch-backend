import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAccountRelation1654101171945 implements MigrationInterface {
  name = 'UserAccountRelation1654101171945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`account\` CHANGE \`userId\` \`userId\` int UNSIGNED NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`account\` ADD CONSTRAINT \`FK_60328bf27019ff5498c4b977421\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`account\` DROP FOREIGN KEY \`FK_60328bf27019ff5498c4b977421\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`account\` CHANGE \`userId\` \`userId\` int NOT NULL`,
    );
  }
}
