import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from "typeorm";
import { Ticket } from "./Ticket";
import { Users } from "./User";

@Entity()
export class TicketMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages, {
    nullable: false,
    onDelete: "CASCADE",
  })
  ticket: Ticket;

  @ManyToOne(() => Users, { nullable: true })
  sender: Users | null;

  @Column("text")
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
