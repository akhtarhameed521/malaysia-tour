import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationEmployeeEntity1777054819475 implements MigrationInterface {
    name = 'NotificationEmployeeEntity1777054819475'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "employeeId" integer`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_6018a5cad24d71d841a407929cb" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_6018a5cad24d71d841a407929cb"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "employeeId"`);
    }

}
