import { MigrationInterface, QueryRunner } from "typeorm";

export class DaySessionEntities1776183473427 implements MigrationInterface {
    name = 'DaySessionEntities1776183473427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "day" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "dayNumber" integer NOT NULL, "date" date NOT NULL, CONSTRAINT "PK_42e726f6b72349f70b25598b50e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."session_track_enum" AS ENUM('Track 1', 'Track 2', 'Track 3')`);
        await queryRunner.query(`CREATE TABLE "session" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "sessionTitle" character varying(255) NOT NULL, "time" TIME NOT NULL, "location" character varying(255) NOT NULL, "speaker" character varying(255) NOT NULL, "track" "public"."session_track_enum" NOT NULL, "dayId" integer NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "return_airline" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "departureCity" character varying NOT NULL, "departureDate" character varying NOT NULL, "departureTime" character varying NOT NULL, "isReturn" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_57a9659a31d6b389258e1cd26b3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "airline" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "departureCity" character varying NOT NULL, "departureDate" character varying NOT NULL, "departureTime" character varying NOT NULL, "isReturn" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_9a0dd52135c26e0201205412623" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_4ae2cc9e33319c3882a33d7e285" FOREIGN KEY ("dayId") REFERENCES "day"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_4ae2cc9e33319c3882a33d7e285"`);
        await queryRunner.query(`DROP TABLE "airline"`);
        await queryRunner.query(`DROP TABLE "return_airline"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TYPE "public"."session_track_enum"`);
        await queryRunner.query(`DROP TABLE "day"`);
    }

}
