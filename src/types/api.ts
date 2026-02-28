/**
 * API response types for Spotify, YouTube, Cobalt.
 * Project Nova - API DTOs
 */

// --- Spotify API ---
export interface SpotifyTrackItem {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
    };
    duration_ms: number;
}

export interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrackItem[];
    };
}

// --- YouTube API / Invidious ---
export interface YouTubeSearchResult {
    id: string; // Video ID
    title: string;
    channel: string;
    duration: string; // "3:45", etc
}

// --- Cobalt API ---
export interface CobaltRequestPayload {
    url: string;
    vCodec?: string;
    vQuality?: string;
    aFormat?: "mp3" | "opus" | "ogg" | "wav";
    filenamePattern?: "classic" | "pretty" | "basic" | "nerdy";
    isAudioOnly?: boolean;
    isNoTTWatermark?: boolean;
    isTTFullAudio?: boolean;
    isAudioMuted?: boolean;
    dubLang?: boolean;
    disableMetadata?: boolean;
    twitterGif?: boolean;
    vimeoDash?: boolean;
}

export interface CobaltResponse {
    status: "error" | "redirect" | "stream" | "success" | "rate-limit" | "picker";
    url?: string;
    text?: string;
}
