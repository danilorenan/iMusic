import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Pause } from 'lucide-react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { usePlayerStore } from '../../store/PlayerStore';

export const MiniPlayer = () => {
    const router = useRouter();
    const { currentTrack, isPlaying, setIsPlaying } = usePlayerStore();
    const { position, duration } = useProgress();

    if (!currentTrack) return null;

    const togglePlayPause = async () => {
        if (isPlaying) {
            await TrackPlayer.pause();
            setIsPlaying(false);
        } else {
            await TrackPlayer.play();
            setIsPlaying(true);
        }
    };

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View className="absolute bottom-[85px] left-2 right-2 rounded-xl bg-nova-surfaceHover overflow-hidden shadow-lg shadow-black/50">
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/player')}
                className="flex-row items-center p-2"
            >
                <Image
                    source={{ uri: currentTrack.artwork_url || 'https://via.placeholder.com/150' }}
                    className="w-10 h-10 rounded-md bg-[#3E3E3E]"
                />

                <View className="flex-1 justify-center px-3">
                    <Text className="text-white font-bold text-sm" numberOfLines={1}>{currentTrack.title}</Text>
                    <Text className="text-nova-textSecondary text-xs" numberOfLines={1}>{currentTrack.artist}</Text>
                </View>

                <TouchableOpacity onPress={togglePlayPause} className="p-2">
                    {isPlaying ? (
                        <Pause size={24} fill="white" color="white" />
                    ) : (
                        <Play size={24} fill="white" color="white" />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Progress Bar Fininha (Scrobbler nativo de bottom players) */}
            <View className="h-[2px] w-full bg-[#121212]">
                <View
                    className="h-full bg-nova-accent"
                    style={{ width: `${progressPercent}%` }}
                />
            </View>
        </View>
    );
};
