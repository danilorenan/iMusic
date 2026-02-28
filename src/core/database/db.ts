import * as SQLite from 'expo-sqlite';

const DB_NAME = 'projectnova.db';

// Helper to open the database. Since expo-sqlite ~14, openDatabaseSync is the standard synchronous API.
export const getDB = () => SQLite.openDatabaseSync(DB_NAME);

/**
 * Inicializa o banco de dados e roda as migrations necessárias.
 * Deve ser chamado no App.tsx / _layout.tsx durante o boot.
 */
export const initDatabase = () => {
    const db = getDB();

    db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      artwork_url TEXT NOT NULL,
      duration_ms INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS local_tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      artwork_url TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      local_path TEXT NOT NULL,
      downloaded_at INTEGER NOT NULL,
      FOREIGN KEY(id) REFERENCES tracks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cover_image TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      playlist_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      PRIMARY KEY (playlist_id, track_id),
      FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
    );
  `);

    console.log('📦 Database initialized successfully.');
};
