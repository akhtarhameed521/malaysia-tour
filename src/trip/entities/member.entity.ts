import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { Room } from "./room.entity";
import { BaseAppEntity } from "@entities";

@Entity()
export class Member extends BaseAppEntity {
  

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  role: string;

  @Column({ default: false })
  isLead: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ type: "varchar" })
  contactInfo: string;

  @Column({ type: "varchar" })
  description: string;

  @ManyToOne(() => Room, (room) => room.members, {
    onDelete: "CASCADE",
  })
  room: Room;
}