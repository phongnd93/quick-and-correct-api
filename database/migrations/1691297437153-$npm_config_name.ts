import { MigrationInterface, QueryRunner } from "typeorm";

export class $npmConfigName1691297437153 implements MigrationInterface {
    name = '$npmConfigName1691297437153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_games" ADD "is_complete" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_games" DROP COLUMN "is_complete"`);
    }

}
