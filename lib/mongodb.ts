import { MongoClient, Db, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set in environment");
}

const DB_NAME = "biztreck";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Serverless-safe Mongo options.
 *
 * - Small pool: on Vercel every concurrent lambda instance opens its own pool.
 *   A large pool per instance exhausts the Atlas connection limit, after which
 *   new connections queue and requests stall for many seconds.
 * - Explicit timeouts: without these the driver waits on its 30s defaults, so a
 *   briefly unreachable or paused cluster turns into a 10–30s hanging request
 *   instead of a fast, visible failure.
 */
const options = {
  maxPoolSize: 5,
  // Keep one connection warm per instance so the common case (an admin page or
  // Shadow turn) skips the TCP+TLS handshake and answers immediately, while
  // still staying well under Atlas's per-cluster connection ceiling.
  minPoolSize: 1,
  maxIdleTimeMS: 60_000,
  serverSelectionTimeoutMS: 5_000,
  connectTimeoutMS: 5_000,
  socketTimeoutMS: 20_000,
  retryWrites: true,
  compressors: ["zlib" as const],
};

// Cache the connection promise on globalThis in every environment. Module scope
// alone is per-bundle, so route handlers and server components could otherwise
// each build their own client and multiply connections.
if (!global._mongoClientPromise) {
  global._mongoClientPromise = new MongoClient(uri, options)
    .connect()
    .catch((err) => {
      // Don't cache a rejected promise — a transient failure would otherwise
      // poison every later request on this instance.
      global._mongoClientPromise = undefined;
      throw err;
    });
}

const clientPromise: Promise<MongoClient> = global._mongoClientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

export { ObjectId };
