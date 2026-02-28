import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { SpotifyService } from '../../src/services/spotify';
import { TrackListItem } from '../../src/components/track/TrackListItem';

// Para Home da Fase 6, buscaremos tracks aleatórias ou pré-definidas (Top Hits) como "mock" de feed principal
const FEED_QUERY = 'top hits 2024';

export default function HomeScreen() {
    const { data: topTracks, isLoading } = useQuery({
        queryKey: ['home-feed', FEED_QUERY],
        queryFn: () => SpotifyService.searchTracks(FEED_QUERY, 10),
        staleTime: 1000 * 60 * 60, // 1 Hora cacheado
    });

    return (
        <ScrollView
            className="flex-1 bg-nova-background"
            contentContainerStyle={{ paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-16 pb-4">
                <Text className="text-white text-3xl font-bold">Bom dia</Text>
                <TouchableOpacity>
                    <Settings color="#FFFFFF" size={24} />
                </TouchableOpacity>
            </View>

            {/* Recentes Mockados (Grid Spotify style) */}
            <View className="px-4 mb-6 flex-row flex-wrap justify-between">
                {['Músicas Curtidas', 'Top Brasil', 'Daily Mix 1', 'Descobertas'].map((item, idx) => (
                    <TouchableOpacity
                        key={idx}
                        activeOpacity={0.8}
                        className="w-[48%] bg-nova-surface rounded-[4px] flex-row items-center mb-2 overflow-hidden"
                    >
                        <View className="w-14 h-14 bg-[#3E3E3E]" />
                        <Text className="text-white text-xs font-bold flex-1 px-3" numberOfLines={2}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Section de Lançamentos baseada no Search Live */}
            <View className="px-4 mb-4">
                <Text className="text-white text-2xl font-bold mb-4">Feito para você</Text>
                {isLoading ? (
                    <Text className="text-nova-textSecondary">Carregando seus hits...</Text>
                ) : (
                    <View className="bg-nova-surfaceHover rounded-xl p-2">
                        {topTracks?.map((track, i) => (
                            <TrackListItem key={track.id} track={track} index={i} />
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
