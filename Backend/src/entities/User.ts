import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Ticket } from "./Ticket";
import { Events } from "./Event";
import { TicketMessage } from "./TicketMessages";

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

  @Column({ type: "varchar", length: 255, select: false })
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

  @Column({ nullable: true })
  twoFactorCode: string | null;

  @Column({ nullable: true })
  twoFactorExpires: Date | null;

    @OneToMany(() => Ticket, (ticket) => ticket.owner)
  ticketsOwned: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignedTo)
  ticketsAssigned: Ticket[];

  @OneToMany(() => TicketMessage, (message) => message.sender)
  messages: TicketMessage[];

}
