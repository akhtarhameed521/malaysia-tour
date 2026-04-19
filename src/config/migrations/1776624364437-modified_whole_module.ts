import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedWholeModule1776624364437 implements MigrationInterface {
    name = 'ModifiedWholeModule1776624364437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_20a555b299f75843aa53ff8b0ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_20a555b299f75843aa53ff8b0e"`);
        await queryRunner.query(`ALTER TABLE "group_members" RENAME COLUMN "user_id" TO "employee_id"`);
        await queryRunner.query(`ALTER TABLE "group_members" RENAME CONSTRAINT "PK_f5939ee0ad233ad35e03f5c65c1" TO "PK_8ad33ebf6829576347f25208ece"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "password" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "employees" ALTER COLUMN "employeeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "hotel" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "roomNumber" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "floor" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "groupType" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "groups" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "departureCity" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "departureDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "departureTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "isReturn" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "departureCity" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "departureDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "departureTime" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "isReturn" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_9afbbbdf4a7e7ce0fbd6c1ed7c" ON "group_members" ("employee_id") `);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_9afbbbdf4a7e7ce0fbd6c1ed7ce" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_9afbbbdf4a7e7ce0fbd6c1ed7ce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9afbbbdf4a7e7ce0fbd6c1ed7c"`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "isReturn" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "departureTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "departureDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "departureCity" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "airline" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "isReturn" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "departureTime" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "departureDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "departureCity" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "return_airline" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "groups" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "groupType" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "floor" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "roomNumber" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "hotel" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employees" ALTER COLUMN "employeeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "group_members" RENAME CONSTRAINT "PK_8ad33ebf6829576347f25208ece" TO "PK_f5939ee0ad233ad35e03f5c65c1"`);
        await queryRunner.query(`ALTER TABLE "group_members" RENAME COLUMN "employee_id" TO "user_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_20a555b299f75843aa53ff8b0e" ON "group_members" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "group_members" ADD CONSTRAINT "FK_20a555b299f75843aa53ff8b0ee" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
