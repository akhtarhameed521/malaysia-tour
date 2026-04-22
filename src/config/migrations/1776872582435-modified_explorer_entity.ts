import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedExplorerEntity1776872582435 implements MigrationInterface {
    name = 'ModifiedExplorerEntity1776872582435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "latitude" character varying`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "longitude" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "position" jsonb`);
    }

}
