import {
  users,
  sessions,
  stripeCustomers,
  stripeSubscriptions,
  stripeOrders,
  categories,
  posts,
  campaigns,
  contentIdeas,
  calendarEvents,
  type User,
  type InsertUser,
  type Session,
  type InsertSession,
  type StripeCustomer,
  type InsertStripeCustomer,
  type StripeSubscription,
  type InsertStripeSubscription,
  type StripeOrder,
  type InsertStripeOrder,
  type Category,
  type InsertCategory,
  type Post,
  type InsertPost,
  type Campaign,
  type InsertCampaign,
  type ContentIdea,
  type InsertContentIdea,
  type CalendarEvent,
  type InsertCalendarEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull, desc } from "drizzle-orm";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;

  // Stripe customer operations
  getStripeCustomer(userId: number): Promise<StripeCustomer | undefined>;
  getStripeCustomerByCustomerId(customerId: string): Promise<StripeCustomer | undefined>;
  createStripeCustomer(customer: InsertStripeCustomer): Promise<StripeCustomer>;

  // Stripe subscription operations
  getStripeSubscription(customerId: string): Promise<StripeSubscription | undefined>;
  createStripeSubscription(subscription: InsertStripeSubscription): Promise<StripeSubscription>;
  updateStripeSubscription(customerId: string, updates: Partial<InsertStripeSubscription>): Promise<StripeSubscription | undefined>;

  // Stripe order operations
  createStripeOrder(order: InsertStripeOrder): Promise<StripeOrder>;
  getStripeOrders(customerId: string): Promise<StripeOrder[]>;
  getAllUsers(): Promise<User[]>;

  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategory(id: number, userId: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, userId: number, updates: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number, userId: number): Promise<void>;

  // Post operations
  getPosts(userId: number): Promise<Post[]>;
  getPost(id: number, userId: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, userId: number, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number, userId: number): Promise<void>;

  // Campaign operations
  getCampaigns(userId: number): Promise<Campaign[]>;
  getCampaign(id: number, userId: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, userId: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number, userId: number): Promise<void>;

  // Content idea operations
  getContentIdeas(userId: number): Promise<ContentIdea[]>;
  getContentIdea(id: number, userId: number): Promise<ContentIdea | undefined>;
  createContentIdea(idea: InsertContentIdea): Promise<ContentIdea>;
  updateContentIdea(id: number, userId: number, updates: Partial<InsertContentIdea>): Promise<ContentIdea | undefined>;
  deleteContentIdea(id: number, userId: number): Promise<void>;

  // Calendar event operations
  getCalendarEvents(userId: number): Promise<CalendarEvent[]>;
  getCalendarEvent(id: number, userId: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, userId: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number, userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Session operations
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
    return session || undefined;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(eq(sessions.expiresAt, new Date()));
  }

  // Stripe customer operations
  async getStripeCustomer(userId: number): Promise<StripeCustomer | undefined> {
    const [customer] = await db
      .select()
      .from(stripeCustomers)
      .where(and(eq(stripeCustomers.userId, userId), isNull(stripeCustomers.deletedAt)));
    return customer || undefined;
  }

  async getStripeCustomerByCustomerId(customerId: string): Promise<StripeCustomer | undefined> {
    const [customer] = await db
      .select()
      .from(stripeCustomers)
      .where(and(eq(stripeCustomers.customerId, customerId), isNull(stripeCustomers.deletedAt)));
    return customer || undefined;
  }

  async createStripeCustomer(customer: InsertStripeCustomer): Promise<StripeCustomer> {
    const [newCustomer] = await db
      .insert(stripeCustomers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  // Stripe subscription operations
  async getStripeSubscription(customerId: string): Promise<StripeSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(stripeSubscriptions)
      .where(and(eq(stripeSubscriptions.customerId, customerId), isNull(stripeSubscriptions.deletedAt)));
    return subscription || undefined;
  }

  async createStripeSubscription(subscription: InsertStripeSubscription): Promise<StripeSubscription> {
    const [newSubscription] = await db
      .insert(stripeSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async updateStripeSubscription(customerId: string, updates: Partial<InsertStripeSubscription>): Promise<StripeSubscription | undefined> {
    const [subscription] = await db
      .update(stripeSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(stripeSubscriptions.customerId, customerId), isNull(stripeSubscriptions.deletedAt)))
      .returning();
    return subscription || undefined;
  }

  // Stripe order operations
  async createStripeOrder(order: InsertStripeOrder): Promise<StripeOrder> {
    const [newOrder] = await db
      .insert(stripeOrders)
      .values(order)
      .returning();
    return newOrder;
  }

  async getStripeOrders(customerId: string): Promise<StripeOrder[]> {
    return await db
      .select()
      .from(stripeOrders)
      .where(and(eq(stripeOrders.customerId, customerId), isNull(stripeOrders.deletedAt)));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(desc(categories.createdAt));
  }

  async getCategory(id: number, userId: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, userId: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Post operations
  async getPosts(userId: number): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getPost(id: number, userId: number): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)));
    return post || undefined;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async updatePost(id: number, userId: number, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .returning();
    return post || undefined;
  }

  async deletePost(id: number, userId: number): Promise<void> {
    await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)));
  }

  // Campaign operations
  async getCampaigns(userId: number): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number, userId: number): Promise<Campaign | undefined> {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(campaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async updateCampaign(id: number, userId: number, updates: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .returning();
    return campaign || undefined;
  }

  async deleteCampaign(id: number, userId: number): Promise<void> {
    await db
      .delete(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)));
  }

  // Content idea operations
  async getContentIdeas(userId: number): Promise<ContentIdea[]> {
    return await db
      .select()
      .from(contentIdeas)
      .where(eq(contentIdeas.userId, userId))
      .orderBy(desc(contentIdeas.createdAt));
  }

  async getContentIdea(id: number, userId: number): Promise<ContentIdea | undefined> {
    const [idea] = await db
      .select()
      .from(contentIdeas)
      .where(and(eq(contentIdeas.id, id), eq(contentIdeas.userId, userId)));
    return idea || undefined;
  }

  async createContentIdea(idea: InsertContentIdea): Promise<ContentIdea> {
    const [newIdea] = await db
      .insert(contentIdeas)
      .values(idea)
      .returning();
    return newIdea;
  }

  async updateContentIdea(id: number, userId: number, updates: Partial<InsertContentIdea>): Promise<ContentIdea | undefined> {
    const [idea] = await db
      .update(contentIdeas)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(contentIdeas.id, id), eq(contentIdeas.userId, userId)))
      .returning();
    return idea || undefined;
  }

  async deleteContentIdea(id: number, userId: number): Promise<void> {
    await db
      .delete(contentIdeas)
      .where(and(eq(contentIdeas.id, id), eq(contentIdeas.userId, userId)));
  }

  // Calendar event operations
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(desc(calendarEvents.createdAt));
  }

  async getCalendarEvent(id: number, userId: number): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .select()
      .from(calendarEvents)
      .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)));
    return event || undefined;
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db
      .insert(calendarEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateCalendarEvent(id: number, userId: number, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const [event] = await db
      .update(calendarEvents)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
      .returning();
    return event || undefined;
  }

  async deleteCalendarEvent(id: number, userId: number): Promise<void> {
    await db
      .delete(calendarEvents)
      .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)));
  }
}

export const storage = new DatabaseStorage();