import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEntity1775887030824 implements MigrationInterface {
    name = 'UserEntity1775887030824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "employeeId" character varying(100) NOT NULL, "fullName" character varying(100), "email" character varying(100), "phone" character varying(20), "image" character varying(20), "password" character varying(100), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying(100) NOT NULL, "password" character varying(100) NOT NULL, CONSTRAINT "UQ_4ba6d0c734d53f8e1b2e24b6c56" UNIQUE ("username"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
