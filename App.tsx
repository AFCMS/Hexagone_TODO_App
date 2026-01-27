import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { useCameraFlash } from "./hooks/useCameraFlash";
import { useMorseFeedback } from "./hooks/useMorseFeedback";

import { HomeScreen } from "./screens/HomeScreen";
import { ConfigScreen } from "./screens/ConfigScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  useMorseFeedback();
  const { element: cameraFlashElement } = useCameraFlash();

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {cameraFlashElement}
      <Stack.Navigator id="morse-nav">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: "Morse Player",
          }}
        />
        <Stack.Screen name="Config" component={ConfigScreen} options={{}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
