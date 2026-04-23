import { BaseAppEntity } from "@entities";
import { Column, Entity, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { EmployeeEntity } from "../../entities/employee.entity";
import { ChatMessage } from "./chat-message.entity";

@Entity("chat_rooms")
export class ChatRoom extends BaseAppEntity {

    @Column({ type: "varchar", length: 150 })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "boolean", default: false })
    isGlobal: boolean;

    @ManyToMany(() => EmployeeEntity, { eager: true })
    @JoinTable({
        name: "chat_room_members",
        joinColumn: { name: "chatRoomId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "employeeId", referencedColumnName: "id" },
    })
    members: EmployeeEntity[];

    @OneToMany(() => ChatMessage, (message: ChatMessage) => message.chatRoom)
    messages: ChatMessage[];
}
