# MongoDB → Cloudflare D1 migration

Status (2026-11-24): **groundwork complete, data copied, app still on MongoDB.**

The live site keeps reading and writing **MongoDB Atlas** (`lib/mongodb.ts`,
DB name `biztreck`). A full copy of that data now also lives in **Cloudflare
D1**, and the Worker is bound to it — but no application code reads D1 yet. This
was a deliberate, safe stopping point: a faithful cutover is a large, risky
rewrite (see "Why not a full cutover tonight" below) and the site's behaviour
had to stay identical.

## What is done

- **D1 database created**: `biztreck` (id `31af1ed8-9a68-43bd-9d7b-2d15621d46ce`,
  region APAC).
- **Schema**: [`db/schema.sql`](../db/schema.sql) — one table per Mongo
  collection, 15 tables. JSON-document model:

  ```sql
  CREATE TABLE c_<collection> (
    id         TEXT PRIMARY KEY,   -- Mongo _id (hex string)
    created_at TEXT,               -- ISO, promoted from doc.createdAt
    updated_at TEXT,               -- ISO, promoted from doc.updatedAt
    doc        TEXT NOT NULL       -- the full document as JSON
  );
  ```

  Hot-path fields are indexed with `json_extract`, e.g.
  `CREATE INDEX ... ON c_leados_leads (json_extract(doc,'$.leadKey'))`.
- **Data copied**: 697 documents across 15 collections (leados_leads 420,
  blogs 102, scraped_places 80, sent_emails 61, clients 12, invoices 6,
  employees 3, admin_users 3, jobs 2, contacts 2, client_documents 4,
  shadow_conversations 1, admins 1, plus empty integrations / biztreck-admin).
  Verified: D1 row counts match Mongo and `json_extract` queries work.
- **Worker binding**: `wrangler.jsonc` → `d1_databases[0]` exposes the DB as
  `env.biztreck`.

Tables (Mongo collection → D1 table): `admin_users→c_admin_users`,
`admins→c_admins`, `blogs→c_blogs`, `client_documents→c_client_documents`,
`clients→c_clients`, `contacts→c_contacts`, `employees→c_employees`,
`integrations→c_integrations`, `invoices→c_invoices`, `jobs→c_jobs`,
`leados_leads→c_leados_leads`, `scraped_places→c_scraped_places`,
`sent_emails→c_sent_emails`, `shadow_conversations→c_shadow_conversations`,
`biztreck-admin→c_biztreck_admin`.

## Why not a full cutover tonight

- **~37 source files** touch Mongo through `getDb()` and use document-shaped
  queries (nested objects + arrays: `leados_leads.analysis/intel/outreach/scores`,
  `clients.milestones/payments/showcase`, `scraped_places.location/openingHours`).
- D1 is **SQLite (relational)**. Making the app relational means remodelling
  those nested shapes into child tables and rewriting every query/update — or
  keeping the JSON-document model (as above) and rewriting the whole data-access
  layer to use `json_extract` / `json_set`.
- Either path is a sizeable rewrite that cannot be verified safely unattended,
  and the brief was "functionality stays exactly the same." So the data was
  migrated (reversible, non-destructive) and the code cutover was left as the
  next, reviewable step.

## How to finish the cutover (recommended next step)

Keep the JSON-document model — it maps 1:1 to the current Mongo usage and needs
no schema redesign.

1. Add a thin D1 data layer, e.g. `lib/d1.ts`, exposing `getDoc`, `find`,
   `insert`, `update`, `delete` over the `doc` JSON column, reading
   `getCloudflareContext().env.biztreck` (from `@opennextjs/cloudflare`).
2. Port `lib/mongodb.ts` consumers collection by collection (start read-only:
   blogs, jobs, clients), running Mongo and D1 in parallel and diffing results.
3. Flip writes once reads are verified; then retire `MONGODB_URI`.
4. Re-sync data before go-live (the copy below is a point-in-time snapshot).

## Re-running the data copy

The generator reads Mongo and writes `db/schema.sql` plus a `data.sql`
(data.sql is **not** committed — it contains real customer records). Apply with:

```bash
npx wrangler d1 execute biztreck --remote --file=db/schema.sql -y
npx wrangler d1 execute biztreck --remote --file=/path/to/data.sql -y
```

Query D1 directly, e.g.:

```bash
npx wrangler d1 execute biztreck --remote -y \
  --command "SELECT json_extract(doc,'\$.title') FROM c_blogs LIMIT 5;"
```
