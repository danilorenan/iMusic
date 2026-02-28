import { Track } from '../../types';
import { TrackRepository } from '../database/repositories';
import { YouTubeService } from '../../services/youtube';
import { CobaltService } from '../../services/youtube/cobalt';
import TrackPlayer, { Track as RNTrack } from 'react-native-track-player';
import { usePlayerStore } from '../../store/PlayerStore';

/**
 * Audio Pipeline Master Class (O Motor de Resolução)
 * Orchestrates: Local Cache Check -> YouTube Search -> Cobalt Audio Extract -> Track Player Inject
 */
export const AudioPipeline = {
    playTrack: async (track: Track) => {
        const store = usePlayerStore.getState();
        store.setCurrentTrack(track);
        store.setIsBuffering(true);

        try {
            // 1. Verifica no SQLite se a faixa já foi baixada
            const localTrack = TrackRepository.getLocalTrackById(track.id);
            let playableUrl = '';

            if (localTrack && localTrack.local_path) {
                console.log('📦 Tunning from Local Storage:', localTrack.local_path);
                playableUrl = localTrack.local_path;
            } else {
                // 2. Modo Streaming: Busca YouTube
                console.log('📡 Search Streaming for:', track.artist, track.title);
                const searchQuery = `${track.artist} - ${track.title}`;
                const ytResult = await YouTubeService.searchAudioContent(searchQuery);

                if (!ytResult) throw new Error('Could not find corresponding audio stream on Youtube');

                // 3. Resolve Cobalt Stream
                console.log('⚙️ Resolving via Cobalt:', ytResult.id);
                playableUrl = await CobaltService.resolveAudioStream(ytResult.id);
            }

            // 4. Executa no TrackPlayer
            const playerTrack: RNTrack = {
                id: track.id,
                url: playableUrl,
                title: track.title,
                artist: track.artist,
                artwork: track.artwork_url,
                duration: track.duration_ms / 1000,
            };

            await TrackPlayer.reset();
            await TrackPlayer.add([playerTrack]);
            await TrackPlayer.play();

            store.setIsPlaying(true);
            store.setIsBuffering(false);

        } catch (error) {
            store.setIsBuffering(false);
            store.setIsPlaying(false);
            console.error('Audio Pipeline failed to play track:', error);
            // Aqui pode-se implementar o fallback de pular para a proxima musica: AudioPipeline.skipToNext() e Toast notification.
        }
    },

    skipToNext: async () => {
        const store = usePlayerStore.getState();
        const { queue, currentTrack } = store;

        if (queue.length === 0) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        const nextTrack = queue[currentIndex + 1];

        if (nextTrack) {
            await AudioPipeline.playTrack(nextTrack);
        } else {
            await TrackPlayer.stop();
            store.setIsPlaying(false);
        }
    }
};
