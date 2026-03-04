import axios from 'axios';
import { YouTubeSearchResult } from '../../types';

// Função recursiva para encontrar o vídeo dentro do JSON gigante do YouTube
const findVideoRenderer = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return null;
    if (obj.videoRenderer && obj.videoRenderer.videoId) return obj.videoRenderer;
    
    for (const key in obj) {
        const result = findVideoRenderer(obj[key]);
        if (result) return result;
    }
    return null;
};

export const YouTubeService = {
    searchAudioContent: async (searchQuery: string): Promise<YouTubeSearchResult | null> => {
        const query = `${searchQuery} audio`;
        
        try {
            // Buscamos direto na fonte (YouTube) sem usar APIs intermediárias!
            // Enganamos o YouTube enviando um User-Agent de PC para não sermos bloqueados
            const { data } = await axios.get(`https://www.youtube.com/results`, {
                params: { search_query: query },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });

            // O YouTube embute os dados da pesquisa em uma variável javascript chamada ytInitialData
            const match = data.match(/ytInitialData\s*=\s*(\{.*?\});<\/script>/);
            
            if (match && match[1]) {
                const jsonData = JSON.parse(match[1]);
                const video = findVideoRenderer(jsonData);
                
                if (video) {
                    return {
                        id: video.videoId,
                        title: video.title?.runs?.[0]?.text || 'Unknown Title',
                        channel: video.ownerText?.runs?.[0]?.text || 'Unknown Channel',
                        duration: video.lengthText?.simpleText || '0',
                    };
                }
            }
            
            throw new Error('Could not parse ytInitialData or no video found.');
            
        } catch (error: any) {
            console.error('Direct YouTube Search Error:', error.message);
            return null;
        }
    }
};