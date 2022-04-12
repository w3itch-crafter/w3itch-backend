import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyTokenEntity1649752583029 implements MigrationInterface {
  name = 'ModifyTokenEntity1649752583029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`token\` DROP COLUMN \`chainName\``);
    await queryRunner.query(
      `ALTER TABLE \`token\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`token\` ADD \`decimals\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` ADD \`donationAddress\` varchar(255) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`rating\``);
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD \`rating\` int NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`rating\` DROP COLUMN \`rating\``);
    await queryRunner.query(
      `ALTER TABLE \`rating\` ADD \`rating\` decimal NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`game\` DROP COLUMN \`donationAddress\``,
    );
    await queryRunner.query(`ALTER TABLE \`token\` DROP COLUMN \`decimals\``);
    await queryRunner.query(`ALTER TABLE \`token\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`token\` ADD \`chainName\` varchar(255) NOT NULL`,
    );
  }
}
