// import { MigrationInterface, QueryRunner } from "typeorm";

// export class AddEmployeeEntity1775888507055 implements MigrationInterface {
//     name = 'AddEmployeeEntity1775888507055'

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`CREATE TABLE "employees" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" character varying(100) NOT NULL, "fullName" character varying(100), "email" character varying(100), "phone" character varying(20), CONSTRAINT "UQ_fa00ce161b51b02fdf992ea9528" UNIQUE ("employeeId"), CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`DROP TABLE "employees"`);
//     }

// }
