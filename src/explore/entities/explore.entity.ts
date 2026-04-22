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

    @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
    rating: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    distance: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    duration: string;

    @Column({ type: "varchar",  nullable: true })
    latitude: string;

    @Column({ type: "varchar",  nullable: true })
    longitude: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    image: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    tag: string;

    @Column({ type: "text", nullable: true })
    details: string;
}
