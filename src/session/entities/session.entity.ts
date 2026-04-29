import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { BaseAppEntity } from "@entities";
import { SessionTrack } from "@types";
import { GroupEntity } from "../../group/entities/group.entity";

@Entity()
export class Session extends BaseAppEntity {
  @Column({ type: "varchar", length: 255 })
  sessionTitle: string;

  @Column({ type: "time", nullable: true })   // ← was non-nullable
  time: string;

  @Column({ type: "date", nullable: true })   // ← was non-nullable
  date: string;

  @Column({ type: "varchar", length: 255, nullable: true })  // ← was non-nullable
  location: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  speaker: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  airlineName: string;

  @Column({ type: "varchar", length: 255, nullable: true })  // ← was non-nullable
  track: string;

  @ManyToMany(() => GroupEntity, { cascade: true })
  @JoinTable({ name: "session_groups" })
  groups: GroupEntity[];
}
