import { MigrationInterface, QueryRunner } from "typeorm";

export class SafetyEntity1776636171384 implements MigrationInterface {
    name = 'SafetyEntity1776636171384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "safety_tips" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying(50), "title" character varying(255), "description" text, "phoneNumber" character varying(20), CONSTRAINT "PK_bdf56fbbeffd7811270d48cdef2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "safety_tips"`);
    }

}
