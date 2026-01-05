import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { TicketMessage } from "./TicketMessages";
import { Users } from "./User";

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @ManyToOne(() => Users, (user) => user.ticketsOwned, { nullable: false })
  owner: Users;

  @ManyToOne(() => Users, (user) => user.ticketsAssigned, { nullable: true })
  assignedTo: Users;

  @Column({ default: "open" })
  status: "open" | "closed";

  @OneToMany(() => TicketMessage, (message) => message.ticket, { cascade: true })
  messages: TicketMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}