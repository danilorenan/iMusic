import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';

import '../src/assets/global.css'; // NativeWind
import { initDatabase } from '../src/core/database/db';
import { setupPlayer } from '../src/core/player/setup';

const queryClient = new QueryClient();

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function bootApp() {
            try {
                // 1. Inicializa o banco de dados (Tabelas Tracks, Playlists, etc)
                initDatabase();

                // 2. Inicializa o setup do Audio Player
                await setupPlayer();

            } catch (err) {
                console.error('System Boot Failed:', err);
            } finally {
                setIsReady(true);
            }
        }

        bootApp();
    }, []);

    if (!isReady) {
        // Tela de Splash base preta enquanto carrega
        return <View style={{ flex: 1, backgroundColor: '#121212' }} />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <StatusBar style="light" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#121212' },
                    }}
                >
                    {/* As abas principais do app */}
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    {/* A tela do Player Full que sobe sendo um modal full-screen custom */}
                    <Stack.Screen
                        name="player"
                        options={{
                            presentation: 'fullScreenModal',
                            animation: 'slide_from_bottom',
                        }}
                    />
                </Stack>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
