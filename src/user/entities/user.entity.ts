import { BaseAppEntity } from "@entities";
import { Column, Entity } from "typeorm";

@Entity("users")
export class UserEntity extends BaseAppEntity {

    @Column({ type: "varchar", length: 100, nullable: true })
    employeeId: string

    @Column({ type: "varchar", length: 100, nullable: true })
    fullName: string

    @Column({ type: "varchar", length: 100, nullable: true })
    email: string

 
    @Column({ type: "varchar", length: 20, nullable: true })
    phone: string

     @Column({ type: "varchar", length: 255, nullable: true })
    image: string

    @Column({ type: "varchar", length: 100, nullable: true })
    password: string
}