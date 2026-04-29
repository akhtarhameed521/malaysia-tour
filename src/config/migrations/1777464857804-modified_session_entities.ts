import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedSessionEntities1777464857804 implements MigrationInterface {
    name = 'ModifiedSessionEntities1777464857804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "time" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "location" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "track" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "track" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "location" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "date" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ALTER COLUMN "time" SET NOT NULL`);
    }

}
