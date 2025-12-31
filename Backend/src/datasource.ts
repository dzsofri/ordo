import "reflect-metadata";
import { DataSource } from "typeorm";
import { Chat } from "./entities/Chat";
import { Events } from "./entities/Event";
import { Users } from "./entities/User";
import { Ticket } from "./entities/Tickets";

const isDev = process.env.NODE_ENV !== "production";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DBHOST || "localhost",
  port: 3306,
  username: process.env.DB_USER,        
  password: process.env.DB_USER_PASS,
  database: process.env.DBNAME,
  entities: [Users, Events, Chat, Ticket],
  logging: false,
  synchronize: isDev,
  dropSchema: false,
});
