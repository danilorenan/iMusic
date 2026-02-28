import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import { Track } from '../types';
import { TrackRepository } from '../core/database/repositories';
import { YouTubeService } from '../services/youtube';
import { CobaltService } from '../services/youtube/cobalt';

export interface DownloadTask {
    track: Track;
    progress: number; // 0 to 1
    status: 'pending' | 'downloading' | 'completed' | 'error';
    resumable?: FileSystem.DownloadResumable;
}

interface DownloadManagerStore {
    activeDownloads: Record<string, DownloadTask>; // Keyed by track ID

    // Actions
    addTrackToDownload: (track: Track) => Promise<void>;
    cancelDownload: (trackId: string) => Promise<void>;
    clearCompleted: () => void;
}

export const useDownloadManagerStore = create<DownloadManagerStore>((set, get) => ({
    activeDownloads: {},

    addTrackToDownload: async (track: Track) => {
        // 1. Evita duplicidade
        if (get().activeDownloads[track.id] || TrackRepository.getLocalTrackById(track.id)) {
            return;
        }

        set((state) => ({
            activeDownloads: {
                ...state.activeDownloads,
                [track.id]: { track, progress: 0, status: 'pending' }
            }
        }));

        try {
            // 2. Resolve Cobalt Pipeline (obter a URL de download real)
            const searchQuery = `${track.artist} - ${track.title}`;
            const ytResult = await YouTubeService.searchAudioContent(searchQuery);
            if (!ytResult) throw new Error('Not found on YouTube');

            const downloadUrl = await CobaltService.resolveAudioStream(ytResult.id);

            // 3. Define onde será salvo (dentro do App Context)
            const sanitizedName = `${track.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${track.id}.mp3`;
            const fileUri = `${FileSystem.documentDirectory}${sanitizedName}`;

            // 4. Inicia o expo-file-system Download API (Com report de progresso)
            const downloadResumable = FileSystem.createDownloadResumable(
                downloadUrl,
                fileUri,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    set((state) => {
                        const currentDraft = { ...state.activeDownloads };
                        if (currentDraft[track.id]) {
                            currentDraft[track.id].progress = progress;
                            currentDraft[track.id].status = 'downloading';
                        }
                        return { activeDownloads: currentDraft };
                    });
                }
            );

            // Mutação segura injetando a task na store para caso o usuário queira cancelar
            set((state) => {
                const d = { ...state.activeDownloads };
                if (d[track.id]) d[track.id].resumable = downloadResumable;
                return { activeDownloads: d };
            });

            // 5. Baixar de Fato (await)
            const result = await downloadResumable.downloadAsync();

            if (result && result.uri) {
                set((state) => {
                    const d = { ...state.activeDownloads };
                    d[track.id].status = 'completed';
                    d[track.id].progress = 1;
                    return { activeDownloads: d };
                });

                // 6. DB: Salva Relação no SQLite como Música Offline Local (id, local_path...)
                TrackRepository.saveLocalTrack({
                    ...track,
                    local_path: result.uri,
                    downloaded_at: Date.now()
                });

                console.log(`✅ Downloaded and saved: ${track.title}`);
            }

        } catch (error) {
            console.error(`❌ Download falhou para ${track.title}:`, error);
            set((state) => {
                const d = { ...state.activeDownloads };
                d[track.id].status = 'error';
                return { activeDownloads: d };
            });
        }
    },

    cancelDownload: async (trackId: string) => {
        const task = get().activeDownloads[trackId];
        if (task && task.status === 'downloading' && task.resumable) {
            await task.resumable.cancelAsync();
        }
        set((state) => {
            const d = { ...state.activeDownloads };
            delete d[trackId];
            return { activeDownloads: d };
        });
    },

    clearCompleted: () => {
        set((state) => {
            const d = { ...state.activeDownloads };
            Object.keys(d).forEach(k => {
                if (d[k].status === 'completed' || d[k].status === 'error') {
                    delete d[k];
                }
            });
            return { activeDownloads: d };
        });
    }
}));
