import { Entity, Column, OneToMany } from "typeorm";
import { BaseAppEntity } from "@entities";
import { Session } from "../../session/entities/session.entity";

@Entity()
export class Day extends BaseAppEntity {
  @Column({ type: "int" })
  dayNumber: number;

  @Column({ type: "date" })
  date: string; // TypeORM maps date to string (YYYY-MM-DD)

  @OneToMany(() => Session, (session) => session.day, {
    cascade: true,
  })
  sessions: Session[];
}
