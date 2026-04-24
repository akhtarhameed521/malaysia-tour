import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationModifiedUser1776980770591 implements MigrationInterface {
    name = 'NotificationModifiedUser1776980770591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_6018a5cad24d71d841a407929cb"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "employeeId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "employeeId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_6018a5cad24d71d841a407929cb" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
