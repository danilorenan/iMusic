import { create } from 'zustand';
// @ts-ignore - APIs exist at runtime
import * as FileSystem from 'expo-file-system';
import { Track } from '../types/models';
import { YouTubeService } from '../services/youtube';
import { CobaltService } from '../services/youtube/cobalt';
import { TrackRepository } from '../core/database/repositories';

interface DownloadTask {
    track: Track;
    progress: number;
    status: 'pending' | 'downloading' | 'completed' | 'error';
    resumable?: any;
}

interface DownloadManagerState {
    activeDownloads: Record<string, DownloadTask>;
    addTrackToDownload: (track: Track) => Promise<void>;
    cancelDownload: (trackId: string) => void;
    clearCompleted: () => void;
}

export const useDownloadManagerStore = create<DownloadManagerState>((set, get) => ({
    activeDownloads: {},

    addTrackToDownload: async (track: Track) => {
        const { activeDownloads } = get();
        if (activeDownloads[track.id]) return;

        set((state) => ({
            activeDownloads: {
                ...state.activeDownloads,
                [track.id]: { track, progress: 0, status: 'pending' },
            },
        }));

        try {
            const searchResult = await YouTubeService.searchAudioContent(
                `${track.artist} ${track.title}`
            );
            if (!searchResult) throw new Error('No YouTube result');

            const audioUrl = await CobaltService.resolveAudioStream(searchResult.id);

            const sanitizedName = `${track.title}_${track.id}.mp3`.replace(/[^a-zA-Z0-9._-]/g, '_');
            // @ts-ignore
            const fileUri = `${FileSystem.documentDirectory}${sanitizedName}`;

            // @ts-ignore
            const resumable = FileSystem.createDownloadResumable(
                audioUrl,
                fileUri,
                {},
                (downloadProgress: any) => {
                    const progress =
                        downloadProgress.totalBytesWritten /
                        downloadProgress.totalBytesExpectedToWrite;
                    set((state) => ({
                        activeDownloads: {
                            ...state.activeDownloads,
                            [track.id]: {
                                ...state.activeDownloads[track.id],
                                progress,
                                status: 'downloading' as const,
                            },
                        },
                    }));
                }
            );

            set((state) => ({
                activeDownloads: {
                    ...state.activeDownloads,
                    [track.id]: {
                        ...state.activeDownloads[track.id],
                        resumable,
                        status: 'downloading' as const,
                    },
                },
            }));

            const result = await resumable.downloadAsync();

            if (result?.uri) {
                TrackRepository.saveLocalTrack({
                    ...track,
                    local_path: result.uri,
                    downloaded_at: Date.now(),
                });

                set((state) => ({
                    activeDownloads: {
                        ...state.activeDownloads,
                        [track.id]: {
                            ...state.activeDownloads[track.id],
                            progress: 1,
                            status: 'completed' as const,
                        },
                    },
                }));
            }
        } catch (error) {
            console.error('Download failed:', error);
            set((state) => ({
                activeDownloads: {
                    ...state.activeDownloads,
                    [track.id]: {
                        ...state.activeDownloads[track.id],
                        status: 'error' as const,
                    },
                },
            }));
        }
    },

    cancelDownload: (trackId: string) => {
        const task = get().activeDownloads[trackId];
        if (task?.resumable) {
            task.resumable.pauseAsync();
        }
        set((state) => {
            const { [trackId]: _, ...rest } = state.activeDownloads;
            return { activeDownloads: rest };
        });
    },

    clearCompleted: () => {
        set((state) => {
            const filtered = Object.fromEntries(
                Object.entries(state.activeDownloads).filter(
                    ([_, task]) => task.status !== 'completed' && task.status !== 'error'
                )
            );
            return { activeDownloads: filtered };
        });
    },
}));