CREATE TABLE rooms (
  code TEXT PRIMARY KEY NOT NULL,
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);

CREATE INDEX rooms_expires_at ON rooms(expires_at);
