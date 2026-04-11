import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserConstraints1775889603558 implements MigrationInterface {
    name = 'FixUserConstraints1775889603558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "employeeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "image" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "image" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "employeeId" SET NOT NULL`);
    }

}
