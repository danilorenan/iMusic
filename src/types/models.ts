/**
 * Data models for tracks, playlists, etc.
 * Project Nova - Core Models
 */

export interface Track {
  id: string; // Spotify ID
  title: string;
  artist: string;
  album: string;
  artwork_url: string;
  duration_ms: number;
}

export interface Playlist {
  id: string;
  name: string;
  cover_image?: string;
  created_at: number; // Timestamp
}

export interface LocalTrack extends Track {
  local_path: string; // File URI where the audio is stored
  downloaded_at: number; // Timestamp
}
