import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-3xl font-bold text-success">
        Welcome to my React Native Apps
      </Text>

      <Link href="/onboarding" className="mt-4 px-4 py-2 rounded bg-primary">
        <Text className="text-white">Go to Onboarding</Text>
      </Link>

      <Link
        href="/(auth)/sign-in"
        className="mt-4 px-4 py-2 rounded bg-primary"
      >
        <Text className="text-white">Go to Sign In</Text>
      </Link>

      <Link
        href="/(auth)/sign-up"
        className="mt-4 px-4 py-2 rounded bg-primary"
      >
        <Text className="text-white">Go to Sign Up</Text>
      </Link>

      <Link href="/subscriptions/spotify">
        <Text className="text-white">Spotify Subsription</Text>
      </Link>
      <Link
        href={{ pathname: "/subscriptions/[id]", params: { id: "claude" } }}
      >
        Claude Max Subscription
      </Link>
    </View>
  );
}
