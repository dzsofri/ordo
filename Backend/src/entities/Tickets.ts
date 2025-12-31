import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Users } from "./User";

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  subject: string;

  @Column({ default: "open" })
  status: "open" | "in_progress" | "closed";

  @ManyToOne(() => Users)
  owner: Users;

  @ManyToOne(() => Users, { nullable: true })
  assignedTo: Users | null;

  @CreateDateColumn()
  createdAt: Date;
}
