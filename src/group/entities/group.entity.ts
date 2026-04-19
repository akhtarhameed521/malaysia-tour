import { BaseAppEntity } from "@entities";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
@Entity("groups")
export class GroupEntity extends BaseAppEntity {

    @Column({ type: "varchar", length: 150, nullable: true })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;
}
