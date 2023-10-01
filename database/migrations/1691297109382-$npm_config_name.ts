import { MigrationInterface, QueryRunner } from "typeorm";

export class $npmConfigName1691297109382 implements MigrationInterface {
    name = '$npmConfigName1691297109382'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_game_infos" DROP COLUMN "event_score"`);
        await queryRunner.query(`ALTER TABLE "user_game_infos" DROP COLUMN "time_answer_event"`);
        await queryRunner.query(`ALTER TABLE "user_game_infos" DROP COLUMN "amount_get_top"`);
        await queryRunner.query(`ALTER TABLE "user_game_infos" ADD "event_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user_event_games" ADD "rank" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_event_games" DROP COLUMN "rank"`);
        await queryRunner.query(`ALTER TABLE "user_game_infos" DROP COLUMN "event_name"`);
        await queryRunner.query(`ALTER TABLE "user_game_infos" ADD "amount_get_top" integer`);
        await queryRunner.query(`ALTER TABLE "user_game_infos" ADD "time_answer_event" real`);
        await queryRunner.query(`ALTER TABLE "user_game_infos" ADD "event_score" integer DEFAULT '0'`);
    }

}
