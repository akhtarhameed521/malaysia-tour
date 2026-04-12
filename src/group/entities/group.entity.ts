import { BaseAppEntity } from "@entities";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";

@Entity("groups")
export class GroupEntity extends BaseAppEntity {

    @Column({ type: "varchar", length: 150 })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @ManyToMany(() => UserEntity)
    @JoinTable({ 
        name: "group_members",
        joinColumn: { name: "group_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "user_id", referencedColumnName: "id" }
    })
    members: UserEntity[];
}
