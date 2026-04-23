import { MigrationInterface, QueryRunner } from "typeorm";

export class GroupChatModule1776940389469 implements MigrationInterface {
    name = 'GroupChatModule1776940389469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "content" text NOT NULL, "messageType" character varying(20) NOT NULL DEFAULT 'text', "senderId" integer NOT NULL, "chatRoomId" integer NOT NULL, "readBy" integer array NOT NULL DEFAULT '{}', CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_rooms" ("id" SERIAL NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'Active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "description" text, "isGlobal" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_c69082bd83bffeb71b0f455bd59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat_room_members" ("chatRoomId" integer NOT NULL, "employeeId" integer NOT NULL, CONSTRAINT "PK_629047792c343295d53831473bf" PRIMARY KEY ("chatRoomId", "employeeId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_42fe809da8399af5abfbde939c" ON "chat_room_members" ("chatRoomId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e1919a41eb102e0ae076a8590b" ON "chat_room_members" ("employeeId") `);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_fc6b58e41e9a871dacbe9077def" FOREIGN KEY ("senderId") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_c7fd35e9a8cb40b91bb014441e2" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_room_members" ADD CONSTRAINT "FK_42fe809da8399af5abfbde939cb" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "chat_room_members" ADD CONSTRAINT "FK_e1919a41eb102e0ae076a8590be" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_room_members" DROP CONSTRAINT "FK_e1919a41eb102e0ae076a8590be"`);
        await queryRunner.query(`ALTER TABLE "chat_room_members" DROP CONSTRAINT "FK_42fe809da8399af5abfbde939cb"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_c7fd35e9a8cb40b91bb014441e2"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_fc6b58e41e9a871dacbe9077def"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e1919a41eb102e0ae076a8590b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_42fe809da8399af5abfbde939c"`);
        await queryRunner.query(`DROP TABLE "chat_room_members"`);
        await queryRunner.query(`DROP TABLE "chat_rooms"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
    }

}
