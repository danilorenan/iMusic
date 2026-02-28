import { getDB } from './db';
import { LocalTrackEntity, PlaylistEntity, TrackEntity } from '../../types';

export const TrackRepository = {
    saveTrack: (track: TrackEntity) => {
        const db = getDB();
        db.runSync(
            `INSERT OR REPLACE INTO tracks (id, title, artist, album, artwork_url, duration_ms) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [track.id, track.title, track.artist, track.album, track.artwork_url, track.duration_ms]
        );
    },

    getAllLocalTracks: (): LocalTrackEntity[] => {
        const db = getDB();
        // Usa um cast no sqlite async/sync. `getAllSync` retorna um array genérico.
        return db.getAllSync<LocalTrackEntity>('SELECT * FROM local_tracks ORDER BY downloaded_at DESC');
    },

    saveLocalTrack: (track: LocalTrackEntity) => {
        const db = getDB();

        // Assegura que a música base está em tracks
        db.runSync(
            `INSERT OR IGNORE INTO tracks (id, title, artist, album, artwork_url, duration_ms) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [track.id, track.title, track.artist, track.album, track.artwork_url, track.duration_ms]
        );

        db.runSync(
            `INSERT OR REPLACE INTO local_tracks (id, title, artist, album, artwork_url, duration_ms, local_path, downloaded_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [track.id, track.title, track.artist, track.album, track.artwork_url, track.duration_ms, track.local_path, track.downloaded_at]
        );
    },

    getLocalTrackById: (id: string): LocalTrackEntity | null => {
        const db = getDB();
        return db.getFirstSync<LocalTrackEntity>('SELECT * FROM local_tracks WHERE id = ?', [id]);
    }
};

export const PlaylistRepository = {
    createPlaylist: (id: string, name: string) => {
        const db = getDB();
        db.runSync('INSERT INTO playlists (id, name, created_at) VALUES (?, ?, ?)', [id, name, Date.now()]);
    },

    getAllPlaylists: (): PlaylistEntity[] => {
        const db = getDB();
        return db.getAllSync<PlaylistEntity>('SELECT * FROM playlists ORDER BY created_at DESC');
    },

    addTrackToPlaylist: (playlistId: string, trackId: string) => {
        const db = getDB();
        // Pega o maior order_index para apensar no final
        const maxOrderRes = db.getFirstSync<{ max_order: number | null }>('SELECT MAX(order_index) as max_order FROM playlist_tracks WHERE playlist_id = ?', [playlistId]);
        const nextOrder = (maxOrderRes?.max_order ?? 0) + 1;

        db.runSync(
            'INSERT OR IGNORE INTO playlist_tracks (playlist_id, track_id, added_at, order_index) VALUES (?, ?, ?, ?)',
            [playlistId, trackId, Date.now(), nextOrder]
        );
    },

    getTracksForPlaylist: (playlistId: string): TrackEntity[] => {
        const db = getDB();
        return db.getAllSync<TrackEntity>(
            `SELECT t.* FROM tracks t 
       INNER JOIN playlist_tracks pt ON t.id = pt.track_id 
       WHERE pt.playlist_id = ? 
       ORDER BY pt.order_index ASC`,
            [playlistId]
        );
    }
};
