import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertStripeCustomerSchema, insertStripeSubscriptionSchema, insertStripeOrderSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe (only if valid key is provided)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes('placeholder') && stripeSecretKey.startsWith('sk_');

let stripe: Stripe | null = null;
if (isStripeConfigured) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });
}

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-in-production";

// Middleware to verify JWT token
async function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token 
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ error: error instanceof z.ZodError ? error.errors : 'Failed to create user' });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        token 
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Failed to sign in' });
    }
  });

  app.post("/api/auth/signout", authenticateToken, async (req: Request, res: Response) => {
    // In a more robust implementation, we'd invalidate the token
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req as any).userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  // Stripe routes
  app.post("/api/stripe/create-checkout-session", authenticateToken, async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured. Please contact support." });
    }

    try {
      const { priceId, successUrl, cancelUrl, mode } = req.body;
      
      if (!priceId || !successUrl || !cancelUrl || !mode) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const userId = (req as any).userId;
      
      // Get or create Stripe customer
      let stripeCustomer = await storage.getStripeCustomer(userId);
      let customerId: string;

      if (!stripeCustomer) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: userId.toString() },
        });

        // Save customer to database
        stripeCustomer = await storage.createStripeCustomer({
          userId,
          customerId: customer.id,
        });

        customerId = customer.id;
      } else {
        customerId = stripeCustomer.customerId;
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: mode as 'payment' | 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured. Please contact support." });
    }

    const sig = req.headers['stripe-signature'] as string;
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as Stripe.Checkout.Session;
          
          if (session.mode === 'subscription') {
            await syncCustomerSubscription(session.customer as string);
          } else if (session.mode === 'payment') {
            await createOrder(session);
          }
          break;
          
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await syncCustomerSubscription(subscription.customer as string);
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  });

  app.get("/api/stripe/subscription", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const stripeCustomer = await storage.getStripeCustomer(userId);
      
      if (!stripeCustomer) {
        return res.status(404).json({ error: "No Stripe customer found" });
      }

      const subscription = await storage.getStripeSubscription(stripeCustomer.customerId);
      res.json({ subscription });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ error: 'Failed to get subscription' });
    }
  });

  // Admin middleware
  async function requireAdmin(req: Request, res: Response, next: Function) {
    try {
      const userId = (req as any).userId;
      console.log('Checking admin privileges for user ID:', userId);
      
      const user = await storage.getUser(userId);
      console.log('Found user:', user ? { id: user.id, email: user.email } : 'No user found');
      
      if (!user || user.email !== 'admin@demo.com') {
        console.log('Access denied - not admin user');
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      }
      
      console.log('Admin access granted');
      (req as any).adminUser = user;
      next();
    } catch (error) {
      console.error('Admin check error:', error);
      res.status(500).json({ error: 'Failed to verify admin privileges' });
    }
  }

  // Admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: Request, res: Response) => {
    try {
      console.log('Admin users request from user:', (req as any).adminUser?.email);
      const users = await storage.getAllUsers();
      console.log('Found users:', users.length);
      
      const safeUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      }));

      res.json({ users: safeUsers });
    } catch (error) {
      console.error('Get users error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ 
        error: 'Failed to get users',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Helper functions
  async function syncCustomerSubscription(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      if (subscriptions.data.length === 0) {
        await storage.updateStripeSubscription(customerId, { status: 'not_started' });
        return;
      }

      const subscription = subscriptions.data[0];
      const defaultPaymentMethod = subscription.default_payment_method as Stripe.PaymentMethod | null;

      await storage.updateStripeSubscription(customerId, {
        subscriptionId: subscription.id,
        priceId: subscription.items.data[0].price.id,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        paymentMethodBrand: defaultPaymentMethod?.card?.brand || null,
        paymentMethodLast4: defaultPaymentMethod?.card?.last4 || null,
        status: subscription.status,
      });
    } catch (error) {
      console.error('Error syncing subscription:', error);
    }
  }

  async function createOrder(session: Stripe.Checkout.Session) {
    try {
      await storage.createStripeOrder({
        checkoutSessionId: session.id,
        paymentIntentId: session.payment_intent as string,
        customerId: session.customer as string,
        amountSubtotal: session.amount_subtotal || 0,
        amountTotal: session.amount_total || 0,
        currency: session.currency || 'usd',
        paymentStatus: session.payment_status,
        status: 'completed',
      });
    } catch (error) {
      console.error('Error creating order:', error);
    }
  }

  const httpServer = createServer(app);

  return httpServer;
}
