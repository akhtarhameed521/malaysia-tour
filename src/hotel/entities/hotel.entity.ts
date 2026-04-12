import {
  Entity,
  Column,
  OneToMany,
} from "typeorm";
import { Room } from "../../room/entities/room.entity";
import { BaseAppEntity } from "@entities";

@Entity()
export class Hotel extends BaseAppEntity {
  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  image: string;

  @Column({ nullable: true })
  checkin: string;

  @Column({ nullable: true })
  checkout: string;

  @OneToMany(() => Room, (room) => room.hotel, {
    cascade: true,
  })
  rooms: Room[];
}