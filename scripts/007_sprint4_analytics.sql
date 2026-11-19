BEGIN;
CREATE TABLE IF NOT EXISTS sustainability_settings (
 id varchar(40) PRIMARY KEY, data json NOT NULL, updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sustainability_snapshots (
 id varchar(36) PRIMARY KEY, data json NOT NULL
);
CREATE TABLE IF NOT EXISTS sustainability_exports (
 id varchar(36) PRIMARY KEY, owner varchar(36) NOT NULL, kind varchar(30) NOT NULL,
 status varchar(20) NOT NULL DEFAULT 'PENDIENTE', data json NOT NULL,
 error text, document bytea, created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_sustainability_exports_owner ON sustainability_exports(owner);
CREATE INDEX IF NOT EXISTS ix_sustainability_exports_status ON sustainability_exports(status);
COMMIT;
