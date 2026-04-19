import { Entity, Column } from "typeorm";
import { BaseAppEntity } from "@entities";

@Entity()
export class ReturnAirline extends BaseAppEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  departureCity: string;

  @Column({ nullable: true })
  departureDate: string;

  @Column({ nullable: true })
  departureTime: string;

  @Column({ default: true, nullable: true })
  isReturn: boolean;
}
