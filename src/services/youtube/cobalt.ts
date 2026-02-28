import axios from 'axios';
import { CobaltRequestPayload, CobaltResponse } from '../../types';

// The Cobalt API endpoint. O usuário pode/deve hospedar sua própria instância de Cobalt em produção.
const COBALT_API_URL = process.env.EXPO_PUBLIC_COBALT_API || 'https://api.cobalt.tools/api/json';

export const CobaltService = {
    /**
     * Resolve uma URL de um vídeo do YouTube em um stream de áudio direto
     * @param youtubeVideoId ID do vídeo no YouTube
     * @returns URL direta de streaming MP3/Opus
     */
    resolveAudioStream: async (youtubeVideoId: string): Promise<string> => {
        const payload: CobaltRequestPayload = {
            url: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
            isAudioOnly: true,
            aFormat: "mp3", // 'opus' ou 'mp3'. Mp3 tem compatibilidade melhor no iOS track player.
            disableMetadata: true, // We will inject Spotify's rich metadata on the TrackPlayer instead
        };

        try {
            const { data } = await axios.post<CobaltResponse>(
                COBALT_API_URL,
                payload,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (data.status === 'error' && data.text) {
                throw new Error(`Cobalt Error: ${data.text}`);
            }

            if (data.url) {
                return data.url;
            }

            throw new Error('Cobalt API returned success but empty URL.');
        } catch (error) {
            console.error('Cobalt Resolution Error:', error);
            throw error;
        }
    }
};
