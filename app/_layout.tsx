import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { WatchlistProvider } from '@/context/watchlist-context';

const CinemaTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#E50914',
    background: '#0A0A0F',
    card: '#13131A',
    text: '#FFFFFF',
    border: '#2A2A3A',
    notification: '#E50914',
  },
};

export default function RootLayout() {
  return (
    <WatchlistProvider>
      <ThemeProvider value={CinemaTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            contentStyle: { backgroundColor: '#0A0A0F' },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="[imdbID]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </WatchlistProvider>
  );
}
