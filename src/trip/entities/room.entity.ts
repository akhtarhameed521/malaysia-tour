import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Hotel } from "./hotel.entity";
import { Member } from "./member.entity";
import { BaseAppEntity } from "@entities";

@Entity()
export class Room extends BaseAppEntity {
 

  @Column({ type: "int" })
  roomNumber: number;

  @Column({ type: "int" })
  floor: number;

  @Column({ type: "varchar" })
  groupType: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, {
    onDelete: "CASCADE",
  })
  hotel: Hotel;

  @OneToMany(() => Member, (member) => member.room, {
    cascade: true,
  })
  members: Member[];
}