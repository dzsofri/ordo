import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Chat } from "./Chat";
import { Events } from "./Event";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  HELPERSK = "HELPDESK"
}

export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline"
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @Column({ type: "varchar", nullable: true, default: null })
  resetPasswordToken: string | null;

  @Column({ type: "timestamp", nullable: true, default: null })
  resetPasswordExpires: Date | null;

  @OneToMany(() => Events, (event) => event.user, { onDelete: "CASCADE" })
  events: Events[];

  @OneToMany(() => Chat, (chat) => chat.sender, { onDelete: "CASCADE" })
  sentMessages: Chat[];

  @OneToMany(() => Chat, (chat) => chat.receiver, { onDelete: "CASCADE" })
  receivedMessages: Chat[];

  @Column({ nullable: true })
  twoFactorCode: string | null;

  @Column({ nullable: true })
  twoFactorExpires: Date | null;

}
