import {
  users,
  sessions,
  stripeCustomers,
  stripeSubscriptions,
  stripeOrders,
  type User,
  type InsertUser,
  type Session,
  type InsertSession,
  type StripeCustomer,
  type InsertStripeCustomer,
  type StripeSubscription,
  type InsertStripeSubscription,
  type StripeOrder,
  type InsertStripeOrder
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull } from "drizzle-orm";

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

  async getAllUsers() {
    return await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }
}

export const storage = new DatabaseStorage();