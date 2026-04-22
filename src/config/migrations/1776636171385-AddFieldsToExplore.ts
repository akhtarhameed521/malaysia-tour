import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldsToExplore1776636171385 implements MigrationInterface {
    name = 'AddFieldsToExplore1776636171385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "explore" ADD "rating" numeric(3,2)`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "distance" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "duration" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "position" jsonb`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "image" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "explore" ADD "tag" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "tag"`);
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "position"`);
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "distance"`);
        await queryRunner.query(`ALTER TABLE "explore" DROP COLUMN "rating"`);
    }

}
