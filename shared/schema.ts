import { pgTable, text, serial, integer, boolean, timestamp, bigint } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions table for user authentication
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stripe customers table
export const stripeCustomers = pgTable("stripe_customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  customerId: text("customer_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Stripe subscriptions table
export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: serial("id").primaryKey(),
  customerId: text("customer_id").notNull().unique(),
  subscriptionId: text("subscription_id"),
  priceId: text("price_id"),
  currentPeriodStart: bigint("current_period_start", { mode: "number" }),
  currentPeriodEnd: bigint("current_period_end", { mode: "number" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  paymentMethodBrand: text("payment_method_brand"),
  paymentMethodLast4: text("payment_method_last4"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Stripe orders table
export const stripeOrders = pgTable("stripe_orders", {
  id: serial("id").primaryKey(),
  checkoutSessionId: text("checkout_session_id").notNull(),
  paymentIntentId: text("payment_intent_id").notNull(),
  customerId: text("customer_id").notNull(),
  amountSubtotal: bigint("amount_subtotal", { mode: "number" }).notNull(),
  amountTotal: bigint("amount_total", { mode: "number" }).notNull(),
  currency: text("currency").notNull(),
  paymentStatus: text("payment_status").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  stripeCustomer: one(stripeCustomers, {
    fields: [users.id],
    references: [stripeCustomers.userId],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const stripeCustomersRelations = relations(stripeCustomers, ({ one, many }) => ({
  user: one(users, {
    fields: [stripeCustomers.userId],
    references: [users.id],
  }),
  subscriptions: many(stripeSubscriptions),
  orders: many(stripeOrders),
}));

export const stripeSubscriptionsRelations = relations(stripeSubscriptions, ({ one }) => ({
  customer: one(stripeCustomers, {
    fields: [stripeSubscriptions.customerId],
    references: [stripeCustomers.customerId],
  }),
}));

export const stripeOrdersRelations = relations(stripeOrders, ({ one }) => ({
  customer: one(stripeCustomers, {
    fields: [stripeOrders.customerId],
    references: [stripeCustomers.customerId],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions);

export const insertStripeCustomerSchema = createInsertSchema(stripeCustomers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const insertStripeSubscriptionSchema = createInsertSchema(stripeSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const insertStripeOrderSchema = createInsertSchema(stripeOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type InsertStripeCustomer = z.infer<typeof insertStripeCustomerSchema>;
export type StripeSubscription = typeof stripeSubscriptions.$inferSelect;
export type InsertStripeSubscription = z.infer<typeof insertStripeSubscriptionSchema>;
export type StripeOrder = typeof stripeOrders.$inferSelect;
export type InsertStripeOrder = z.infer<typeof insertStripeOrderSchema>;
