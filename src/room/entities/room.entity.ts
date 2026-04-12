import {
  Entity,
  Column,
  ManyToOne,
} from "typeorm";
import { Hotel } from "../../hotel/entities/hotel.entity";
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
}