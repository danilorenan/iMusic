import TrackPlayer, { AppKilledBehavior, Capability, RatingType, RepeatMode } from 'react-native-track-player';

// Controle para saber se já foi inicializado e não dar crash ao recarregar via Fast Refresh no Expo
let isSetup = false;

export const setupPlayer = async () => {
    if (isSetup) return;

    try {
        await TrackPlayer.setupPlayer({
            maxCacheSize: 1024 * 10, // 10MB limite de cache buffer
            waitForBuffer: true,
        });

        await TrackPlayer.updateOptions({
            android: {
                appKilledBehavior: AppKilledBehavior.StopPlaybackAndRemoveNotification,
            },
            // Habilita as capabilities na tela de bloqueio e central de controle
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.Stop,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
            ],
            progressUpdateEventInterval: 2, // Emissão de evento a cada 2 seg
        });

        await TrackPlayer.setRepeatMode(RepeatMode.Off);

        isSetup = true;
        console.log('🎵 Track Player Initialized');
    } catch (err) {
        console.log('Error setting up Track Player:', err);
    }
};
