
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-in-production";

async function generateAdminToken() {
  // This matches the admin user ID from the database
  const adminUserId = 1;
  
  const token = jwt.sign({ userId: adminUserId }, JWT_SECRET, { expiresIn: '7d' });
  
  console.log('Generated admin token:');
  console.log(token);
  console.log('\nYou can use this token by setting it in localStorage:');
  console.log(`localStorage.setItem('token', '${token}');`);
  
  // Also show the admin credentials
  console.log('\nAdmin credentials:');
  console.log('Email: admin@demo.com');
  console.log('Password: admin123');
}

generateAdminToken().catch(console.error);
