import { MigrationInterface, QueryRunner } from "typeorm";

export class SessionModifiedApi1776983449259 implements MigrationInterface {
    name = 'SessionModifiedApi1776983449259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ADD "airlineName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "speaker" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "speaker" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "airlineName"`);
    }

}
