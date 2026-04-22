import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSessionInEmployee1776878515314 implements MigrationInterface {
    name = 'AddedSessionInEmployee1776878515314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "sessions" jsonb DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "sessions"`);
    }

}
