import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedSessionModuleEntity1776876933553 implements MigrationInterface {
    name = 'ModifiedSessionModuleEntity1776876933553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_4ae2cc9e33319c3882a33d7e285"`);
        await queryRunner.query(`CREATE TABLE "session_groups" ("sessionId" integer NOT NULL, "groupsId" integer NOT NULL, CONSTRAINT "PK_d9854efb38c5bdff9c4be870d2b" PRIMARY KEY ("sessionId", "groupsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ce44dbf1d64876ea0c321fef63" ON "session_groups" ("sessionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a77eca6d817dba773985b5a589" ON "session_groups" ("groupsId") `);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "dayId"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "track"`);
        await queryRunner.query(`DROP TYPE "public"."session_track_enum"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "track" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session_groups" ADD CONSTRAINT "FK_ce44dbf1d64876ea0c321fef631" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "session_groups" ADD CONSTRAINT "FK_a77eca6d817dba773985b5a589f" FOREIGN KEY ("groupsId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_groups" DROP CONSTRAINT "FK_a77eca6d817dba773985b5a589f"`);
        await queryRunner.query(`ALTER TABLE "session_groups" DROP CONSTRAINT "FK_ce44dbf1d64876ea0c321fef631"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "track"`);
        await queryRunner.query(`CREATE TYPE "public"."session_track_enum" AS ENUM('Track 1', 'Track 2', 'Track 3')`);
        await queryRunner.query(`ALTER TABLE "session" ADD "track" "public"."session_track_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "dayId" integer NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a77eca6d817dba773985b5a589"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce44dbf1d64876ea0c321fef63"`);
        await queryRunner.query(`DROP TABLE "session_groups"`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_4ae2cc9e33319c3882a33d7e285" FOREIGN KEY ("dayId") REFERENCES "day"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
