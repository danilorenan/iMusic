import { create } from 'zustand';
import { Track } from '../types';

interface PlayerState {
    currentTrack: Track | null;
    queue: Track[];
    isPlaying: boolean;
    isBuffering: boolean;

    // Ações
    setCurrentTrack: (track: Track | null) => void;
    setQueue: (tracks: Track[]) => void;
    setIsPlaying: (playing: boolean) => void;
    setIsBuffering: (buffering: boolean) => void;

    // Ações complexas
    playTrack: (track: Track) => void;
    playQueue: (tracks: Track[], startIndex: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    isBuffering: false,

    setCurrentTrack: (track) => set({ currentTrack: track }),
    setQueue: (tracks) => set({ queue: tracks }),
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setIsBuffering: (buffering) => set({ isBuffering: buffering }),

    playTrack: (track) => {
        // A lógica de invocar o TrackPlayer ficará no hook ou pipeline. O Store apenas reflete a UI.
        set({ currentTrack: track, queue: [track], isPlaying: true, isBuffering: true });
    },

    playQueue: (tracks, startIndex) => {
        const track = tracks[startIndex];
        if (track) {
            set({ currentTrack: track, queue: tracks, isPlaying: true, isBuffering: true });
        }
    }
}));
