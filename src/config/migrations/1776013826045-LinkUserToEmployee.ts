import { MigrationInterface, QueryRunner } from "typeorm";

export class LinkUserToEmployee1776013826045 implements MigrationInterface {
    name = 'LinkUserToEmployee1776013826045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "employee_id_fk" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_d199a06181e8bcfd7c752d96d07" UNIQUE ("employee_id_fk")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_d199a06181e8bcfd7c752d96d07" FOREIGN KEY ("employee_id_fk") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d199a06181e8bcfd7c752d96d07"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_d199a06181e8bcfd7c752d96d07"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "employee_id_fk"`);
    }

}
