import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { BaseAppEntity } from "@entities";
import { SessionTrack } from "@types";
import { GroupEntity } from "../../group/entities/group.entity";

@Entity()
export class Session extends BaseAppEntity {
  @Column({ type: "varchar", length: 255 })
  sessionTitle: string;

  @Column({ type: "time" })
  time: string; 

  @Column({ type: "date" })
  date: string;

  @Column({ type: "varchar", length: 255 })
  location: string;

  @Column({ type: "varchar", length: 255 })
  speaker: string;

  @Column({ type: "varchar", length: 255 })
  track: string;

  @ManyToMany(() => GroupEntity)
  @JoinTable({ name: "session_groups" })
  groups: GroupEntity[];
}
