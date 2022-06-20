import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTableUserAvatar1655646827134 implements MigrationInterface {
    name = 'AlterTableUserAvatar1655646827134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` varchar(255) NOT NULL DEFAULT 'https://image.w3itch.io/w3itch-test/attachment/5/c388baa8-c244-4782-9807-978a8dcb7700.png'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` varchar(255) NOT NULL DEFAULT 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png'`);
    }

}
