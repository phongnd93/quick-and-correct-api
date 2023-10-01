import { MigrationInterface, QueryRunner } from "typeorm";

export class $npmConfigName1692024040472 implements MigrationInterface {
    name = '$npmConfigName1692024040472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_games" ADD "current_user" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_games" DROP COLUMN "current_user"`);
    }

}
