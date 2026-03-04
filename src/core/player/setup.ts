import TrackPlayer, { Capability, RepeatMode, AppKilledPlaybackBehavior } from 'react-native-track-player';

export async function setupPlayer(): Promise<boolean> {
  try {
    await TrackPlayer.getActiveTrack();
    return true;
  } catch {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 10,
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
      ],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    return true;
  }
}