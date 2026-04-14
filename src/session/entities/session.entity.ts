import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseAppEntity } from "@entities";
import { Day } from "../../day/entities/day.entity";
import { SessionTrack } from "@types";

@Entity()
export class Session extends BaseAppEntity {
  @Column({ type: "varchar", length: 255 })
  sessionTitle: string;

  @Column({ type: "time" })
  time: string; // TypeORM maps time to string (HH:mm:ss)

  @Column({ type: "varchar", length: 255 })
  location: string;

  @Column({ type: "varchar", length: 255 })
  speaker: string;

  @Column({ type: "enum", enum: SessionTrack })
  track: SessionTrack;

  @ManyToOne(() => Day, (day) => day.sessions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "dayId" })
  day: Day;

  @Column()
  dayId: number;
}
