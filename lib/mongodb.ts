import { MongoClient, Db, ObjectId } from "mongodb";

const DB_NAME = "biztreck";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Serverless-safe Mongo options.
 *
 * - Small pool: on Vercel/Workers every concurrent instance opens its own pool.
 *   A large pool per instance exhausts the Atlas connection limit, after which
 *   new connections queue and requests stall for many seconds.
 * - Explicit timeouts: without these the driver waits on its 30s defaults, so a
 *   briefly unreachable or paused cluster turns into a 10–30s hanging request
 *   instead of a fast, visible failure.
 * - No wire compression and no warm minPoolSize: zlib compression and
 *   background keep-alive heartbeats are unreliable on Cloudflare Workers
 *   (workerd), where they can hang the connection.
 */
const options = {
  maxPoolSize: 5,
  minPoolSize: 0,
  maxIdleTimeMS: 60_000,
  serverSelectionTimeoutMS: 5_000,
  connectTimeoutMS: 5_000,
  socketTimeoutMS: 20_000,
  retryWrites: true,
};

/**
 * Lazily creates (and caches) the connection promise. Connecting on first use —
 * never at import/module scope — is required on Cloudflare Workers, which
 * disallow network I/O in the global scope; it also lets `next build` finish
 * before env vars exist.
 */
function getClientPromise(): Promise<MongoClient> {
  if (global._mongoClientPromise) return global._mongoClientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment");
  }

  global._mongoClientPromise = new MongoClient(uri, options)
    .connect()
    .catch((err) => {
      // Don't cache a rejected promise — a transient failure would otherwise
      // poison every later request on this instance.
      global._mongoClientPromise = undefined;
      throw err;
    });

  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}

export { ObjectId };
