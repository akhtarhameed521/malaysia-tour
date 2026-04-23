import { BaseAppEntity } from "@entities";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { EmployeeEntity } from "../../entities/employee.entity";
import { ChatRoom } from "./chat-room.entity";

@Entity("chat_messages")
export class ChatMessage extends BaseAppEntity {

    @Column({ type: "text" })
    content: string;

    @Column({ type: "varchar", length: 20, default: "text" })
    messageType: string; // text, image, file

    @ManyToOne(() => EmployeeEntity, { eager: true })
    @JoinColumn({ name: "senderId" })
    sender: EmployeeEntity;

    @Column({ type: "int" })
    senderId: number;

    @ManyToOne(() => ChatRoom, (room: ChatRoom) => room.messages, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chatRoomId" })
    chatRoom: ChatRoom;

    @Column({ type: "int" })
    chatRoomId: number;

    @Column({ type: "int", array: true, default: [] })
    readBy: number[]; // array of employee IDs who have read this message
}
