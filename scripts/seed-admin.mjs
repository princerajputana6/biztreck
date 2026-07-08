#!/usr/bin/env node
/**
 * Seed or update the MongoDB admin login.
 *
 * Run:
 *   npm run seed:admin
 *
 * Uses:
 *   ADMIN_EMAIL    optional, defaults to admin@biztreck.com
 *   ADMIN_PASSWORD required
 *   MONGODB_URI    required
 */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const password = process.env.ADMIN_PASSWORD;
const email = (process.env.ADMIN_EMAIL || "admin@biztreck.com")
  .trim()
  .toLowerCase();

if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

if (!password) {
  console.error("ADMIN_PASSWORD is required");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("biztreck");
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  await db.collection("admin_users").updateOne(
    { email },
    {
      $set: {
        email,
        passwordHash,
        active: true,
        role: "admin",
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );

  await db.collection("admin_users").createIndex({ email: 1 }, { unique: true });

  console.log(`Seeded admin user: ${email}`);
} finally {
  await client.close();
}
