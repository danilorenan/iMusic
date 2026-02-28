/**
 * SQLite database types and schemas.
 * Project Nova - Database Entities
 */

export interface TrackEntity {
    id: string; // Primary Key (Spotify ID)
    title: string;
    artist: string;
    album: string;
    artwork_url: string;
    duration_ms: number;
}

export interface PlaylistEntity {
    id: string; // UUID ou ID numérico
    name: string;
    cover_image: string | null;
    created_at: number; // Timestamp Unix
}

export interface PlaylistTrackEntity {
    playlist_id: string; // Foreign Key
    track_id: string; // Foreign Key
    added_at: number; // Timestamp Unix
    order_index: number;
}

export interface LocalTrackEntity extends TrackEntity {
    local_path: string; // Caminho do arquivo via expo-file-system
    downloaded_at: number; // Timestamp Unix
}
