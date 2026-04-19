import { Entity, Column } from "typeorm";
import { BaseAppEntity } from "../../entities/base.entity";
import { ExploreType } from "../../types";

@Entity("explore")
export class Explore extends BaseAppEntity {
    @Column({
        type: "varchar",
        length: 50,
        nullable: true
    })
    type: ExploreType;

    @Column({ type: "varchar", length: 255, nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    location: string;

    @Column({ type: "text", nullable: true })
    details: string;
}
