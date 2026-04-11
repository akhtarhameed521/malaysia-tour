import { BaseAppEntity } from "./base.entity";
import { Column, Entity } from "typeorm";

@Entity("employees")
export class EmployeeEntity extends BaseAppEntity {

    @Column({ type: "varchar", length: 100, unique: true })
    employeeId: string

    @Column({ type: "varchar", length: 100, nullable: true })
    fullName: string

    @Column({ type: "varchar", length: 100, nullable: true })
    email: string

    @Column({ type: "varchar", length: 20, nullable: true })
    phone: string
}
