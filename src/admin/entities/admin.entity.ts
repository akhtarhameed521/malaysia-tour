import { BaseAppEntity } from "@entities";
import { Column, Entity } from "typeorm";

@Entity("admins")
export class AdminEntity extends BaseAppEntity {

    @Column({ type: "varchar", length: 100, unique: true })
    username: string

    @Column({ type: "varchar", length: 100 })
    password: string

   
}
