import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Users } from "./User";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Users, (user) => user.sentMessages, { onDelete: "CASCADE", eager: true })
  sender: Users;

  @ManyToOne(() => Users, (user) => user.receivedMessages, { onDelete: "CASCADE", eager: true })
  receiver: Users;

  @Column("text")
  message: string;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;
}
