import { BaseAppEntity } from "../../entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { EmployeeEntity } from "../../entities/employee.entity";

@Entity("notifications")
export class Notification extends BaseAppEntity {

    @Column({ type: "varchar", nullable: true })
    type: string;

    @Column({ type: "varchar", nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    message: string;

    @Column({ type: "boolean", default: false })
    isRead: boolean;

    @Column({ type: "int", default: 0 })
    order: number;

    @ManyToOne(() => EmployeeEntity, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "employeeId" })
    employee: EmployeeEntity;
}
