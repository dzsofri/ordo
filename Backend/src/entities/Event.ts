import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Users } from "./User";

@Entity()
export class Events {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "timestamp" })
  occurrence: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @Column({ type: "varchar", length: 7, nullable: true })
  color: string | null;

  @ManyToOne(() => Users, (user) => user.events, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: Users;
}
