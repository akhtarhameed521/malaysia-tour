import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { Room } from "./room.entity";
import { BaseAppEntity } from "@entities";

@Entity()
export class Hotel extends BaseAppEntity {
  @Column()
  hotelName: string;

  @Column({ nullable: true })
  checkin: string;

  @Column({ nullable: true })
  checkout: string;

  @OneToMany(() => Room, (room) => room.hotel, {
    cascade: true,
  })
  rooms: Room[];
}