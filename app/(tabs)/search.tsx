import { View, Text, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react-native';
import { SpotifyService } from '../../src/services/spotify';
import { TrackListItem } from '../../src/components/track/TrackListItem';
import { useDebounce } from '../../src/hooks/useDebounce';

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 600); // Aguarda 600ms após o user parar de digitar

    const { data: tracks, isLoading, error } = useQuery({
        queryKey: ['spotify-search', debouncedQuery],
        queryFn: () => SpotifyService.searchTracks(debouncedQuery),
        enabled: debouncedQuery.length > 2, // Só busca se tiver 3+ letras
        staleTime: 1000 * 60 * 5, // Casha por 5 minutos
    });

    return (
        <View className="flex-1 bg-nova-background pt-14">
            {/* Header & Input */}
            <View className="px-4 pb-4">
                <Text className="text-white text-3xl font-bold mb-4">Buscar</Text>

                <View className="flex-row items-center bg-nova-surface rounded-lg px-3 py-2">
                    <Search size={20} color="#B3B3B3" />
                    <TextInput
                        placeholder="O que você quer ouvir?"
                        placeholderTextColor="#B3B3B3"
                        className="flex-1 text-white text-base ml-2 bg-transparent border-0 outline-none"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            {/* Results / List */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            ) : error ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-400">Erro ao buscar músicas. Verifique a internet.</Text>
                </View>
            ) : (
                <FlatList
                    data={tracks || []}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <TrackListItem track={item} index={index} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 150 }} // Espaço pro BottomTab e MiniPlayer
                    ListEmptyComponent={
                        debouncedQuery.length > 2 ? (
                            <Text className="text-nova-textSecondary text-center mt-10">Nenhuma música encontrada.</Text>
                        ) : null
                    }
                />
            )}
        </View>
    );
}
