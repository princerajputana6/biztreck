-- Biztreck D1 schema (JSON-document model, generated from MongoDB 'biztreck')
-- Each Mongo collection -> one table: id TEXT PK + created_at/updated_at + doc(JSON).
-- Hot-path fields are indexed via json_extract. See docs/D1-MIGRATION.md.
PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS c_admin_users;
CREATE TABLE c_admin_users (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_admin_users_email ON c_admin_users (json_extract(doc, '$.email'));

DROP TABLE IF EXISTS c_admins;
CREATE TABLE c_admins (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_admins_email ON c_admins (json_extract(doc, '$.email'));
CREATE INDEX IF NOT EXISTS c_admins_username ON c_admins (json_extract(doc, '$.username'));

DROP TABLE IF EXISTS c_biztreck_admin;
CREATE TABLE c_biztreck_admin (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);

DROP TABLE IF EXISTS c_blogs;
CREATE TABLE c_blogs (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_blogs_slug ON c_blogs (json_extract(doc, '$.slug'));
CREATE INDEX IF NOT EXISTS c_blogs_status ON c_blogs (json_extract(doc, '$.status'));

DROP TABLE IF EXISTS c_client_documents;
CREATE TABLE c_client_documents (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_client_documents_clientId ON c_client_documents (json_extract(doc, '$.clientId'));

DROP TABLE IF EXISTS c_clients;
CREATE TABLE c_clients (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_clients_status ON c_clients (json_extract(doc, '$.status'));
CREATE INDEX IF NOT EXISTS c_clients_email ON c_clients (json_extract(doc, '$.email'));

DROP TABLE IF EXISTS c_contacts;
CREATE TABLE c_contacts (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_contacts_email ON c_contacts (json_extract(doc, '$.email'));

DROP TABLE IF EXISTS c_employees;
CREATE TABLE c_employees (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_employees_email ON c_employees (json_extract(doc, '$.email'));
CREATE INDEX IF NOT EXISTS c_employees_status ON c_employees (json_extract(doc, '$.status'));

DROP TABLE IF EXISTS c_integrations;
CREATE TABLE c_integrations (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);

DROP TABLE IF EXISTS c_invoices;
CREATE TABLE c_invoices (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_invoices_clientId ON c_invoices (json_extract(doc, '$.clientId'));
CREATE INDEX IF NOT EXISTS c_invoices_status ON c_invoices (json_extract(doc, '$.status'));

DROP TABLE IF EXISTS c_jobs;
CREATE TABLE c_jobs (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_jobs_active ON c_jobs (json_extract(doc, '$.active'));

DROP TABLE IF EXISTS c_leados_leads;
CREATE TABLE c_leados_leads (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_leados_leads_leadKey ON c_leados_leads (json_extract(doc, '$.leadKey'));
CREATE INDEX IF NOT EXISTS c_leados_leads_stage ON c_leados_leads (json_extract(doc, '$.stage'));
CREATE INDEX IF NOT EXISTS c_leados_leads_email ON c_leados_leads (json_extract(doc, '$.email'));
CREATE INDEX IF NOT EXISTS c_leados_leads_domain ON c_leados_leads (json_extract(doc, '$.domain'));

DROP TABLE IF EXISTS c_scraped_places;
CREATE TABLE c_scraped_places (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_scraped_places_placeId ON c_scraped_places (json_extract(doc, '$.placeId'));
CREATE INDEX IF NOT EXISTS c_scraped_places_city ON c_scraped_places (json_extract(doc, '$.city'));

DROP TABLE IF EXISTS c_sent_emails;
CREATE TABLE c_sent_emails (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS c_sent_emails_to ON c_sent_emails (json_extract(doc, '$.to'));
CREATE INDEX IF NOT EXISTS c_sent_emails_leadKey ON c_sent_emails (json_extract(doc, '$.leadKey'));

DROP TABLE IF EXISTS c_shadow_conversations;
CREATE TABLE c_shadow_conversations (
  id TEXT PRIMARY KEY,
  created_at TEXT,
  updated_at TEXT,
  doc TEXT NOT NULL
);

