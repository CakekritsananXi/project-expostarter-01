import { pgTable, text, serial, integer, boolean, timestamp, bigint, date, jsonb } from "drizzle-orm/pg-core";
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

// Content Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3B82F6"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  excerpt: text("excerpt"),
  status: text("status").notNull().default("draft"), // draft, scheduled, published, archived
  type: text("type").notNull().default("blog"), // blog, social, email, video, etc.
  tags: text("tags").array().default([]),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  featuredImage: text("featured_image"),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"), // planning, active, completed, paused
  startDate: date("start_date"),
  endDate: date("end_date"),
  goals: text("goals").array().default([]),
  targetAudience: text("target_audience"),
  budget: integer("budget"),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content Ideas table
export const contentIdeas = pgTable("content_ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").default("blog"), // blog, social, video, email, etc.
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("idea"), // idea, researching, outlined, in_progress, completed
  tags: text("tags").array().default([]),
  targetDate: date("target_date"),
  estimatedHours: integer("estimated_hours"),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Events table for editorial calendar
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  eventType: text("event_type").notNull().default("content"), // content, deadline, meeting, launch
  status: text("status").default("scheduled"), // scheduled, completed, cancelled
  allDay: boolean("all_day").default(false),
  duration: integer("duration"), // in minutes
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  stripeCustomer: one(stripeCustomers, {
    fields: [users.id],
    references: [stripeCustomers.userId],
  }),
  categories: many(categories),
  posts: many(posts),
  campaigns: many(campaigns),
  contentIdeas: many(contentIdeas),
  calendarEvents: many(calendarEvents),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  posts: many(posts),
  contentIdeas: many(contentIdeas),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  campaign: one(campaigns, {
    fields: [posts.campaignId],
    references: [campaigns.id],
  }),
  calendarEvents: many(calendarEvents),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  posts: many(posts),
  contentIdeas: many(contentIdeas),
  calendarEvents: many(calendarEvents),
}));

export const contentIdeasRelations = relations(contentIdeas, ({ one }) => ({
  user: one(users, {
    fields: [contentIdeas.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [contentIdeas.categoryId],
    references: [categories.id],
  }),
  campaign: one(campaigns, {
    fields: [contentIdeas.campaignId],
    references: [campaigns.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [calendarEvents.postId],
    references: [posts.id],
  }),
  campaign: one(campaigns, {
    fields: [calendarEvents.campaignId],
    references: [campaigns.id],
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

// Content model schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentIdeaSchema = createInsertSchema(contentIdeas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Content model types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = z.infer<typeof insertContentIdeaSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
