import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';

import '../src/assets/global.css';
import { initDatabase } from '../src/core/database/db';
import { setupPlayer } from '../src/core/player/setup';

const queryClient = new QueryClient();

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function bootApp() {
            try {
                initDatabase();
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
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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