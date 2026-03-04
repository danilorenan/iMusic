import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from '../../store/PlayerStore';
import { YouTubeService } from '../../services/youtube';
import { CobaltService } from '../../services/youtube/cobalt';
import { TrackRepository } from '../database/repositories';
import { Track } from '../../types/models';

export const AudioPipeline = {
  playTrack: async (track: Track, queue?: Track[]) => {
    const store = usePlayerStore.getState();

    try {
      store.setCurrentTrack(track);
      store.setIsPlaying(true);
      store.setIsBuffering(true);

      if (queue) {
        store.setQueue(queue);
      }

      // 1. Check local cache
      const localTrack = TrackRepository.getLocalTrackById(track.id);
      let audioUrl: string;

      if (localTrack) {
        console.log('📁 Playing from local storage');
        audioUrl = localTrack.local_path;
      } else {
        // 2. Resolve via YouTube + Backend
        console.log(`📡 Resolving: ${track.artist} - ${track.title}`);
        const searchResult = await YouTubeService.searchAudioContent(
          `${track.artist} ${track.title}`
        );

        if (!searchResult) {
          throw new Error('Nenhum resultado no YouTube');
        }

        console.log(`⚙️ Getting stream: ${searchResult.id}`);
        audioUrl = await CobaltService.resolveAudioStream(searchResult.id);
      }

      // 3. Play via TrackPlayer
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: track.id,
        url: audioUrl,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork_url,
        duration: track.duration_ms / 1000,
      });
      await TrackPlayer.play();

      store.setIsBuffering(false);
      console.log('▶️ Playing:', track.title);
    } catch (error) {
      store.setIsBuffering(false);
      store.setIsPlaying(false);
      console.error('❌ Pipeline failed:', error);
    }
  },
};