import {
  Entity,
  Column,
  ManyToOne,
} from "typeorm";
import { Hotel } from "../../hotel/entities/hotel.entity";
import { BaseAppEntity } from "@entities";

@Entity()
export class Room extends BaseAppEntity {
 

  @Column({ type: "int", nullable: true })
  roomNumber: number;

  @Column({ type: "int", nullable: true })
  floor: number;

  @Column({ type: "varchar", nullable: true })
  groupType: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, {
    onDelete: "CASCADE",
    nullable: true
  })
  hotel: Hotel;
}