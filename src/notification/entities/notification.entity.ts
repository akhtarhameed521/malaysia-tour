import { BaseAppEntity } from "../../entities/base.entity";
import { Column, Entity } from "typeorm";

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
}
