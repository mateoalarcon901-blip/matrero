import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  description: text().notNull().default(""),
  category: text().notNull().default("General"),
  price: integer().notNull().default(0),
  comparePrice: integer("compare_price").notNull().default(0),
  sizes: text().array().notNull().default([]),
  colors: text().array().notNull().default([]),
  images: text().array().notNull().default([]),
  available: boolean().notNull().default(true),
  featured: boolean().notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
