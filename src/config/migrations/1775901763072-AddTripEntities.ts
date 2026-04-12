// import { MigrationInterface, QueryRunner } from "typeorm";

// export class AddTripEntities1775901763072 implements MigrationInterface {
//     name = 'AddTripEntities1775901763072'

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`CREATE TABLE "hotel" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "hotelName" character varying NOT NULL, "checkin" character varying, "checkout" character varying, CONSTRAINT "PK_3a62ac86b369b36c1a297e9ab26" PRIMARY KEY ("id"))`);
//         await queryRunner.query(`CREATE TABLE "member" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "role" character varying NOT NULL, "isLead" boolean NOT NULL DEFAULT false, "image" character varying, "contactInfo" character varying NOT NULL, "description" character varying NOT NULL, "roomId" integer, CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id"))`);
//         await queryRunner.query(`CREATE TABLE "room" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "roomNumber" integer NOT NULL, "floor" integer NOT NULL, "groupType" character varying NOT NULL, "hotelId" integer, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
//         await queryRunner.query(`ALTER TABLE "member" ADD CONSTRAINT "FK_65f2094390c40918283dba25ec8" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE "room" ADD CONSTRAINT "FK_2fac52abaa01b54156539cad11c" FOREIGN KEY ("hotelId") REFERENCES "hotel"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "room" DROP CONSTRAINT "FK_2fac52abaa01b54156539cad11c"`);
//         await queryRunner.query(`ALTER TABLE "member" DROP CONSTRAINT "FK_65f2094390c40918283dba25ec8"`);
//         await queryRunner.query(`DROP TABLE "room"`);
//         await queryRunner.query(`DROP TABLE "member"`);
//         await queryRunner.query(`DROP TABLE "hotel"`);
//     }

// }
