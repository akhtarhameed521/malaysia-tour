import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateHotelSchema1776018448211 implements MigrationInterface {
    name = 'UpdateHotelSchema1776018448211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hotel" DROP COLUMN "hotelName"`);
        await queryRunner.query(`ALTER TABLE "hotel" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "hotel" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "hotel" ADD "image" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hotel" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "hotel" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "hotel" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "hotel" ADD "hotelName" character varying NOT NULL`);
    }

}
