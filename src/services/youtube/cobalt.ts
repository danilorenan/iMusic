// src/services/youtube/AudioService.ts
import axios from 'axios';

const API_BASE = 'https://imusic-backend.onrender.com';  // ← Sem barra no final

const localCache = new Map<string, { url: string; expiresAt: number }>();

export const CobaltService = {
    resolveAudioStream: async (videoId: string): Promise<string> => {
        const id = videoId.trim();

        const cached = localCache.get(id);
        if (cached && Date.now() < cached.expiresAt) {
            console.log(`⚡ [App Cache] Play instantâneo para ${id}`);
            return cached.url;
        }

        console.log(`📡 Buscando áudio no servidor para: ${id}`);
        const { data } = await axios.get(`${API_BASE}/audio/${id}`, { timeout: 30000 });

        if (!data?.url) throw new Error('Servidor não retornou URL válida');

        localCache.set(id, {
            url: data.url,
            expiresAt: Date.now() + 4 * 60 * 60 * 1000,
        });

        console.log(`🎵 Stream liberado: ${data.format} (~${Math.round(data.bitrate)}kbps) | Cache Servidor: ${data.cached}`);
        return data.url;
    },

    prefetchTracks: async (videoIds: string[]): Promise<void> => {
        const needed = videoIds.filter((id) => {
            const cached = localCache.get(id);
            return !cached || Date.now() >= cached.expiresAt;
        });

        if (needed.length === 0) return;

        try {
            console.log(`🔮 Prefetching ${needed.length} músicas em background...`);
            const { data } = await axios.post(`${API_BASE}/prefetch`, { ids: needed }, { timeout: 30000 });

            for (const id of needed) {
                if (data.results?.[id] === 'resolved' || data.results?.[id] === 'cached') {
                    try {
                        const { data: audioData } = await axios.get(`${API_BASE}/audio/${id}`, { timeout: 5000 });
                        if (audioData?.url) {
                            localCache.set(id, {
                                url: audioData.url,
                                expiresAt: Date.now() + 4 * 60 * 60 * 1000,
                            });
                        }
                    } catch { /* silencioso */ }
                }
            }
            console.log(`✅ Fila aquecida com sucesso!`);
        } catch {
            console.log(`⚠️ Prefetch falhou, mas não afeta o player principal.`);
        }
    },
};