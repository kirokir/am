import { Stack } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../lib/ColorTheme';

export default () => {
  const { signOut } = useAuth();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: 'Connect with Partner',
          headerStyle: { backgroundColor: Colors.offGray },
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: 'Inter-Bold' },
          headerRight: () => (
            <TouchableOpacity onPress={signOut} style={{ marginRight: 10 }}>
              <MaterialCommunityIcons name="logout" size={24} color={Colors.darkText} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};