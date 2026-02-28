import axios from 'axios';
import { YouTubeSearchResult } from '../../types';

// Fallback logic using Invidious API (open source YouTube frontend/extractor)
// To avoid strict Google API Quotas and "Music Video" search bias.
const INVIDIOUS_INSTANCES = [
    'https://vid.puffyan.us',
    'https://invidious.asir.dev',
    'https://invidious.flokinet.to',
];

export const YouTubeService = {
    searchAudioContent: async (searchQuery: string): Promise<YouTubeSearchResult | null> => {
        // Prefer "Topic" or "Audio" videos over Music Videos for better audio quality and no intro clips.
        const query = `${searchQuery} audio`;

        // Tenta instâncias aleatórias do Invidious até uma funcionar (Resiliência)
        for (const instance of INVIDIOUS_INSTANCES) {
            try {
                const { data } = await axios.get(`${instance}/api/v1/search`, {
                    params: {
                        q: query,
                        type: 'video',
                        sort_by: 'relevance',
                    },
                    timeout: 5000,
                });

                if (data && data.length > 0) {
                    const video = data[0];
                    return {
                        id: video.videoId,
                        title: video.title,
                        channel: video.author,
                        duration: video.lengthSeconds ? String(video.lengthSeconds) : '0',
                    };
                }
            } catch (error) {
                console.warn(`Invidious instance ${instance} failed. Retrying next...`);
                continue;
            }
        }

        console.error('All YouTube search instances failed.');
        return null;
    }
};
