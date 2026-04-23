import { MigrationInterface, QueryRunner } from "typeorm";

export class AdditionalUserField1776962406538 implements MigrationInterface {
    name = 'AdditionalUserField1776962406538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "type" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "globalId" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "localId" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "jobTitle" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "function" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "lineManager" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "fastTrack" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "advancePack" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "regionDepartment" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "flightStation" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "gender" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "passportNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "passportIssDate" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "passportExpiryDate" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "nicNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "arrivalTimeKUL" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "UQ_fa00ce161b51b02fdf992ea9528"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "employeeId"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "employeeId" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "UQ_fa00ce161b51b02fdf992ea9528" UNIQUE ("employeeId")`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "fullName" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "hotel"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "hotel" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "role" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "country" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "password" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "password" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "country" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "role" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "hotel"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "hotel" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "email" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "fullName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "UQ_fa00ce161b51b02fdf992ea9528"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "employeeId"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "employeeId" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "UQ_fa00ce161b51b02fdf992ea9528" UNIQUE ("employeeId")`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "arrivalTimeKUL"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "nicNumber"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "passportExpiryDate"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "passportIssDate"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "passportNumber"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "flightStation"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "regionDepartment"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "advancePack"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "fastTrack"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "lineManager"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "function"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "jobTitle"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "localId"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "globalId"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "type"`);
    }

}
