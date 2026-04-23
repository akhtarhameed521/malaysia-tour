import { MigrationInterface, QueryRunner } from "typeorm";

export class AdditionalFieldEmployees1776970628927 implements MigrationInterface {
    name = 'AdditionalFieldEmployees1776970628927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD "isChatBlocked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "additionalField1" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "additionalField2" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "additionalField3" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "additionalField4" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "additionalField5" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "additionalField5"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "additionalField4"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "additionalField3"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "additionalField2"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "additionalField1"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "isChatBlocked"`);
    }

}
