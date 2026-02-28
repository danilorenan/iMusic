import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { Home, Search, Library } from 'lucide-react-native';
import { MiniPlayer } from '../../src/components/player/MiniPlayer';

export default function TabLayout() {
    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#FFFFFF',
                    tabBarInactiveTintColor: '#B3B3B3',
                    tabBarStyle: {
                        position: 'absolute',
                        borderTopWidth: 0,
                        elevation: 0,
                        height: 85,
                        paddingBottom: 25, // iPhone Safe Area padding
                        backgroundColor: 'transparent',
                    },
                    // Efeito Glassmorphism do BlurView da Apple
                    tabBarBackground: () => (
                        <BlurView
                            tint="dark"
                            intensity={80}
                            style={StyleSheet.absoluteFill}
                        />
                    ),
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Início',
                        tabBarIcon: ({ color, focused }) => (
                            <Home color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: 'Buscar',
                        tabBarIcon: ({ color, focused }) => (
                            <Search color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="library"
                    options={{
                        title: 'Biblioteca',
                        tabBarIcon: ({ color, focused }) => (
                            <Library color={color} size={26} strokeWidth={focused ? 2.5 : 2} />
                        ),
                    }}
                />
            </Tabs>

            {/* MiniPlayer Global Renderizado acima do bottom bar */}
            <MiniPlayer />
        </>
    );
}
