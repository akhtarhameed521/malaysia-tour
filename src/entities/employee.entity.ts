import { BaseAppEntity } from "./base.entity";
import { Column, Entity } from "typeorm";

@Entity("employees")
export class EmployeeEntity extends BaseAppEntity {

    @Column({ type: "varchar", unique: true, nullable: true })
    employeeId: string

    @Column({ type: "varchar", nullable: true })
    fullName: string

    @Column({ type: "varchar", nullable: true })
    email: string

    @Column({ type: "varchar", nullable: true })
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

    @Column({ type: "varchar", nullable: true })
    hotel: string

    @Column({ type: "jsonb", nullable: true })
    room: { type: string, number: string }

    @Column({ type: "text", nullable: true })
    image: string

    @Column({ type: "text", nullable: true })
    ticketImage: string

    @Column({ type: "varchar", nullable: true })
    role: string

    @Column({ type: "varchar", nullable: true })
    country: string

    @Column({ type: "varchar", nullable: true })
    type: string

    @Column({ type: "varchar", nullable: true })
    globalId: string

    @Column({ type: "varchar", nullable: true })
    localId: string

    @Column({ type: "varchar", nullable: true })
    jobTitle: string

    @Column({ type: "varchar", nullable: true })
    function: string

    @Column({ type: "varchar", nullable: true })
    lineManager: string

    @Column({ type: "varchar", nullable: true })
    fastTrack: string

    @Column({ type: "varchar", nullable: true })
    advancePack: string

    @Column({ type: "varchar", nullable: true })
    regionDepartment: string

    @Column({ type: "varchar", nullable: true })
    flightStation: string

    @Column({ type: "varchar", nullable: true })
    gender: string

    @Column({ type: "varchar", nullable: true })
    passportNumber: string

    @Column({ type: "varchar", nullable: true })
    passportIssDate: string

    @Column({ type: "varchar", nullable: true })
    passportExpiryDate: string

    @Column({ type: "varchar", nullable: true })
    nicNumber: string

    @Column({ type: "varchar", nullable: true })
    arrivalTimeKUL: string


    @Column({ type: "jsonb", nullable: true, default: [] })
    sessions: any[]

    @Column({ type: "boolean", default: false })
    isChatBlocked: boolean

    @Column({ type: "varchar", nullable: true })
    fcmToken: string

    @Column({ type: "varchar", nullable: true })
    additionalField1: string

    @Column({ type: "varchar", nullable: true })
    additionalField2: string

    @Column({ type: "varchar", nullable: true })
    additionalField3: string

    @Column({ type: "varchar", nullable: true })
    additionalField4: string

    @Column({ type: "varchar", nullable: true })
    additionalField5: string

    @Column({ type: "varchar", nullable: true, select: false })
    password: string
}
