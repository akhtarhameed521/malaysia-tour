import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmployeeEntity1776012153660 implements MigrationInterface {
    name = 'UpdateEmployeeEntity1776012153660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "group" jsonb`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "airline" jsonb`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "returnAirline" jsonb`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "hotel" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "room" jsonb`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "image" text`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "ticketImage" text`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "role" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "country" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "ticketImage"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "room"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "hotel"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "returnAirline"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "airline"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "group"`);
    }

}
