import axios from 'axios';
import { Track } from '../../types';

export const SpotifyService = {
    searchTracks: async (query: string, limit = 20): Promise<Track[]> => {
        try {
            // A API da Apple não precisa de token nenhum!
            const { data } = await axios.get('https://itunes.apple.com/search', {
                params: {
                    term: query,
                    entity: 'song',
                    limit,
                },
            });
            
            // Mapeamos a resposta da Apple para o seu tipo Track
            return data.results.map((item: any) => ({
                id: item.trackId.toString(),
                title: item.trackName,
                artist: item.artistName,
                album: item.collectionName,
                // O iTunes retorna imagens pequenas (100x100), esse replace troca para (600x600)
                artwork_url: item.artworkUrl100.replace('100x100bb', '600x600bb'),
                duration_ms: item.trackTimeMillis,
            }));
        } catch (error) {
            console.error('Erro na Busca:', error);
            throw error;
        }
    },

    getTrackInfo: async (trackId: string): Promise<Track> => {
        // ... (A API do itunes permite buscar por ID usando lookup?id=trackId)
        const { data } = await axios.get(`https://itunes.apple.com/lookup?id=${trackId}`);
        const item = data.results[0];
        return {
            id: item.trackId.toString(),
            title: item.trackName,
            artist: item.artistName,
            album: item.collectionName,
            artwork_url: item.artworkUrl100.replace('100x100bb', '600x600bb'),
            duration_ms: item.trackTimeMillis,
        };
    }
};