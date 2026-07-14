import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // never float, avoids rounding errors on money
  currency: varchar("currency", { length: 3 }).notNull().default("XOF"),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url").notNull(),
  storeId: uuid("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }), // delete store -> its products go too
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// DB-level guarantee matching the SignupStatus union type in packages/shared.
export const signupStatusEnum = pgEnum("signup_status", ["pending", "sent", "failed"]);

export const signups = pgTable(
  "signups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }).notNull(),
    status: signupStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // same email can't sign up twice for the same product (DB-enforced, not just app logic)
    productEmailUnique: uniqueIndex("signups_product_id_email_unique").on(
      table.productId,
      table.email
    ),
  })
);

// Everything below: no columns, no constraints. Just tells Drizzle how tables
// connect so it can do relational queries like db.query.products.findMany({ with: { store: true } }).

export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, { fields: [products.storeId], references: [stores.id] }),
  signups: many(signups),
}));

export const signupsRelations = relations(signups, ({ one }) => ({
  product: one(products, { fields: [signups.productId], references: [products.id] }),
}));
