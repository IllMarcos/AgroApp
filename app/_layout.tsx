// En: app/_layout.tsx

import Colors from '@/constants/Colors'; // Corregido: importación por defecto
import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.tint,
    onPrimary: '#ffffff',
    primaryContainer: Colors.light.accent,
    onPrimaryContainer: Colors.light.tint,
    secondary: Colors.light.tint,
    onSecondary: '#ffffff',
    secondaryContainer: Colors.light.accent,
    onSecondaryContainer: Colors.light.tint,
    tertiary: Colors.light.info,
    onTertiary: '#ffffff',
    tertiaryContainer: '#E2EFFF',
    onTertiaryContainer: Colors.light.info,
    error: Colors.light.error,
    onError: '#ffffff',
    background: Colors.light.background,
    onBackground: Colors.light.text,
    surface: Colors.light.card,
    onSurface: Colors.light.text,
    surfaceVariant: Colors.light.background,
    onSurfaceVariant: Colors.light.textSecondary,
    outline: '#BDBDBD',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level2: Colors.light.card,
    }
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}