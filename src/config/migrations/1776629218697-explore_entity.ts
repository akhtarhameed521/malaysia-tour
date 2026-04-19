import { MigrationInterface, QueryRunner } from "typeorm";

export class ExploreEntity1776629218697 implements MigrationInterface {
    name = 'ExploreEntity1776629218697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "explore" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying(50), "title" character varying(255), "description" text, "location" character varying(255), "details" text, CONSTRAINT "PK_731b326496414997be874e13a5a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "explore"`);
    }

}
