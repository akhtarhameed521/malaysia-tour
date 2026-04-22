import { BaseAppEntity } from "./base.entity";
import { Column, Entity } from "typeorm";

@Entity("employees")
export class EmployeeEntity extends BaseAppEntity {

    @Column({ type: "varchar", length: 100, unique: true, nullable: true })
    employeeId: string

    @Column({ type: "varchar", length: 100, nullable: true })
    fullName: string

    @Column({ type: "varchar", length: 100, nullable: true })
    email: string

    @Column({ type: "varchar", length: 20, nullable: true })
    phone: string

    @Column({ type: "jsonb", nullable: true })
    group: { id: string, name: string }

    @Column({ type: "jsonb", nullable: true })
    airline: {
        name: string,
        details: string,
        departureDate: string,
        departureTime: string,
        departureCity: string
    }

    @Column({ type: "jsonb", nullable: true })
    returnAirline: {
        name: string,
        details: string,
        departureDate: string,
        departureTime: string,
        departureCity: string
    }

    @Column({ type: "varchar", length: 255, nullable: true })
    hotel: string

    @Column({ type: "jsonb", nullable: true })
    room: { type: string, number: string }

    @Column({ type: "text", nullable: true })
    image: string

    @Column({ type: "text", nullable: true })
    ticketImage: string

    @Column({ type: "varchar", length: 50, nullable: true })
    role: string

    @Column({ type: "varchar", length: 100, nullable: true })
    country: string

    @Column({ type: "jsonb", nullable: true, default: [] })
    sessions: any[]

    @Column({ type: "varchar", length: 255, nullable: true, select: false })
    password: string
}
