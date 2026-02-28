import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { SpotifySearchResponse, SpotifyTrackItem, Track } from '../../types';

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET || '';

export const spotifyApi = axios.create({
    baseURL: 'https://api.spotify.com/v1',
});

// Auth endpoint para client credentials flow
const getAccessToken = async (): Promise<string> => {
    const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${credentials}`,
            },
        }
    );
    return response.data.access_token;
};

// Axios Interceptor para adicionar o token e tentar refresh se expirar (401)
spotifyApi.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('SPOTIFY_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

spotifyApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newToken = await getAccessToken();
                await SecureStore.setItemAsync('SPOTIFY_TOKEN', newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return spotifyApi(originalRequest);
            } catch (e) {
                return Promise.reject(e);
            }
        }
        return Promise.reject(error);
    }
);

// Map Spotify DTO to our App Model
const mapSpotifyTrack = (item: SpotifyTrackItem): Track => ({
    id: item.id,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    album: item.album.name,
    artwork_url: item.album.images[0]?.url || '',
    duration_ms: item.duration_ms,
});

export const SpotifyService = {
    searchTracks: async (query: string, limit = 20): Promise<Track[]> => {
        try {
            const { data } = await spotifyApi.get<SpotifySearchResponse>('/search', {
                params: {
                    q: query,
                    type: 'track',
                    limit,
                },
            });
            return data.tracks.items.map(mapSpotifyTrack);
        } catch (error) {
            console.error('Spotify Search Error:', error);
            throw error;
        }
    },

    getTrackInfo: async (trackId: string): Promise<Track> => {
        try {
            const { data } = await spotifyApi.get<SpotifyTrackItem>(`/tracks/${trackId}`);
            return mapSpotifyTrack(data);
        } catch (error) {
            console.error('Spotify Get Track Error:', error);
            throw error;
        }
    }
};
