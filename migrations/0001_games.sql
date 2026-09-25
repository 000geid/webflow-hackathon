CREATE TABLE games (
  id TEXT PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL,
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);

CREATE INDEX games_expires_at ON games(expires_at);
