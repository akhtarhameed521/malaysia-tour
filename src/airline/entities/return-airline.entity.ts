import { Entity, Column } from "typeorm";
import { BaseAppEntity } from "@entities";

@Entity()
export class ReturnAirline extends BaseAppEntity {
  @Column()
  name: string;

  @Column()
  departureCity: string;

  @Column()
  departureDate: string;

  @Column()
  departureTime: string;

  @Column({ default: true })
  isReturn: boolean;
}
