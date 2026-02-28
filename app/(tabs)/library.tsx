import { View, Text, FlatList, Switch } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { LocalTrackEntity } from '../../src/types';
import { TrackRepository } from '../../src/core/database/repositories';
import { TrackListItem } from '../../src/components/track/TrackListItem';
import { useUIStore } from '../../src/store/UIStore';

export default function LibraryScreen() {
    const [offlineTracks, setOfflineTracks] = useState<LocalTrackEntity[]>([]);
    const { isOfflineMode, setOfflineMode } = useUIStore();

    // Executa toda vez que a aba "Biblioteca" ganha foco para atualizar a lista recém baixada
    useFocusEffect(
        useCallback(() => {
            const loadTracks = () => {
                const trks = TrackRepository.getAllLocalTracks();
                setOfflineTracks(trks);
            };
            loadTracks();
        }, [])
    );

    return (
        <View className="flex-1 bg-nova-background pt-14">
            {/* Header */}
            <View className="px-4 pb-4 flex-row justify-between items-center">
                <Text className="text-white text-3xl font-bold">Sua Biblioteca</Text>
            </View>

            {/* Toggles (V1: Apenas botão de Offline Mode) */}
            <View className="px-4 pb-4 flex-row justify-between items-center bg-nova-surface mx-4 rounded-xl py-3 px-4 mb-2">
                <View>
                    <Text className="text-white text-base font-semibold">Modo Offline</Text>
                    <Text className="text-nova-textSecondary text-xs">Apenas músicas baixadas (Wi-Fi off)</Text>
                </View>
                <Switch
                    value={isOfflineMode}
                    onValueChange={setOfflineMode}
                    trackColor={{ false: '#3E3E3E', true: '#1ED760' }}
                    thumbColor={'#fff'}
                />
            </View>

            {/* List */}
            <FlatList
                data={offlineTracks}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => <TrackListItem track={item} index={index} />}
                contentContainerStyle={{ paddingBottom: 150 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="mt-10 items-center justify-center px-6">
                        <Text className="text-white font-bold text-lg">Ainda não há downloads.</Text>
                        <Text className="text-nova-textSecondary text-center mt-2">
                            As músicas que você baixar na navegação aparecerão aqui para escutar sem internet.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
