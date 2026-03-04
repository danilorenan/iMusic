import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react-native';
import TrackPlayer, { useProgress } from '../src/core/player/trackPlayer.mock';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { usePlayerStore } from '../src/store/PlayerStore';
import { AudioPipeline } from '../src/core/player/AudioPipeline';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
    const router = useRouter();
    const { currentTrack, isPlaying, setIsPlaying } = usePlayerStore();
    const { position, duration } = useProgress();

    // Reanimated Hooks para capa da musica reativa:
    const scale = useSharedValue(1);

    useEffect(() => {
        // Anima a capa baseada no estado de play: Menor (Pausa), Normal (Play). Efeito identico Spotify
        scale.value = withSpring(isPlaying ? 1 : 0.85, {
            damping: 15,
            stiffness: 150,
        });
    }, [isPlaying]);

    const animatedImageStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    if (!currentTrack) {
        return <View className="flex-1 bg-nova-background" />;
    }

    const togglePlayPause = async () => {
        if (isPlaying) {
            await TrackPlayer.pause();
            setIsPlaying(false);
        } else {
            await TrackPlayer.play();
            setIsPlaying(true);
        }
    };

    const handleNext = async () => {
        await AudioPipeline.skipToNext();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View className="flex-1 bg-nova-background">
            {/* Background Dinâmico com a Capa + Blur */}
            <Image
                source={{ uri: currentTrack.artwork_url || 'https://via.placeholder.com/150' }}
                style={StyleSheet.absoluteFillObject}
                blurRadius={60} // Fallback se BlurView falhar
            />
            <BlurView tint="dark" intensity={100} style={StyleSheet.absoluteFillObject} />

            {/* Escurecedor extra para legibilidade */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />

            <View className="flex-1 px-6 pt-12 pb-8 justify-between">

                {/* Top Header */}
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()}>
                        <ChevronDown color="white" size={32} />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white text-xs font-bold uppercase tracking-widest">TOCANDO DA SUA BIBLIOTECA</Text>
                        <Text className="text-white text-xs font-bold -mt-0.5">{currentTrack.album || 'Single'}</Text>
                    </View>
                    <View className="w-8" />
                </View>

                {/* Artwork Central (Animated) */}
                <View className="items-center justify-center my-6">
                    <Animated.Image
                        source={{ uri: currentTrack.artwork_url || 'https://via.placeholder.com/400' }}
                        className="rounded-lg shadow-2xl shadow-black"
                        style={[{ width: width - 48, height: width - 48 }, animatedImageStyle]}
                    />
                </View>

                {/* Faixa / Letra */}
                <View className="mb-4 flex-row justify-between items-end">
                    <View className="flex-1 mr-4">
                        <Text className="text-white text-2xl font-bold mb-1" numberOfLines={1}>{currentTrack.title}</Text>
                        <Text className="text-nova-textSecondary text-lg" numberOfLines={1}>{currentTrack.artist}</Text>
                    </View>
                </View>

                {/* Progress Slider (Simplificado via views por hora, no mundo real usa @react-native-community/slider com gestureHandler) */}
                <View className="mb-6">
                    <View className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <View className="h-full bg-white rounded-full" style={{ width: `${progressPercent}%` }} />
                    </View>
                    <View className="flex-row justify-between mt-2">
                        <Text className="text-nova-textSecondary text-xs">{formatTime(position)}</Text>
                        <Text className="text-nova-textSecondary text-xs">-{formatTime(duration - position)}</Text>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row items-center justify-between px-2">
                    <TouchableOpacity><Shuffle color="#B3B3B3" size={24} /></TouchableOpacity>

                    <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}><SkipBack color="white" size={36} fill="white" /></TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={togglePlayPause}
                        className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg"
                    >
                        {isPlaying ? <Pause color="black" size={32} fill="black" /> : <Play color="black" size={32} fill="black" style={{ marginLeft: 4 }} />}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleNext}><SkipForward color="white" size={36} fill="white" /></TouchableOpacity>

                    <TouchableOpacity><Repeat color="#B3B3B3" size={24} /></TouchableOpacity>
                </View>

            </View>
        </View>
    );
}
