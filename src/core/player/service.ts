import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Esse arquivo precisa ser registrado no index.js ou na raiz do app via:
 * TrackPlayer.registerPlaybackService(() => require('./src/core/player/service'));
 * Ele captura interrupções do OS como fechamento do app remoto, fones desconectados, etc.
 */

module.exports = async function () {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
    TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
        // Interrupções (ligação, notificação de som alto)
        if (event.paused) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    });
};
