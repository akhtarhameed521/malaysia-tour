import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationEntities1776978874951 implements MigrationInterface {
    name = 'NotificationEntities1776978874951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying, "title" character varying, "message" text, "isRead" boolean NOT NULL DEFAULT false, "order" integer NOT NULL DEFAULT '0', "employeeId" integer NOT NULL, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "fcmToken" character varying`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_6018a5cad24d71d841a407929cb" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_6018a5cad24d71d841a407929cb"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "fcmToken"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
    }

}
