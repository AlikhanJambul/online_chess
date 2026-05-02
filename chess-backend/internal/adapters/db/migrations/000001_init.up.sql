CREATE TABLE IF NOT EXISTS users (
                                     id TEXT PRIMARY KEY,
                                     name TEXT NOT NULL,
                                     email TEXT NOT NULL,
                                     avatar_url TEXT,
                                     wins INT DEFAULT 0,
                                     losses INT DEFAULT 0,
                                     created_at TIMESTAMPTZ DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS games (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    white_id TEXT REFERENCES users(id),
    black_id TEXT REFERENCES users(id),
    winner_id TEXT REFERENCES users(id),
    pgn TEXT DEFAULT '',
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ
    );

CREATE INDEX IF NOT EXISTS idx_games_white_id ON games(white_id);
CREATE INDEX IF NOT EXISTS idx_games_black_id ON games(black_id);
CREATE INDEX IF NOT EXISTS idx_users_wins ON users(wins DESC);