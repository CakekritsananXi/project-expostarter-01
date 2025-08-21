
import { db } from "../server/db";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

async function createDemoAdmin() {
  try {
    const email = "admin@demo.com";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });

    if (existingAdmin) {
      console.log("Demo admin already exists with email:", email);
      return;
    }

    // Create demo admin user
    const [admin] = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName: "Demo",
      lastName: "Admin",
    }).returning();

    console.log("Demo admin created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("User ID:", admin.id);
    
  } catch (error) {
    console.error("Error creating demo admin:", error);
  } finally {
    process.exit(0);
  }
}

createDemoAdmin();
