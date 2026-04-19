import { Entity, Column } from "typeorm";
import { BaseAppEntity } from "../../entities/base.entity";
import { SafetyType } from "../../types";

@Entity("safety_tips")
export class SafetyEntity extends BaseAppEntity {
    @Column({
        type: "varchar",
        length: 50,
        nullable: true
    })
    type: SafetyType;

    @Column({ type: "varchar", length: 255, nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", length: 20, nullable: true })
    phoneNumber: string;
}
