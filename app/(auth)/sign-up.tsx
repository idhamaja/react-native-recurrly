import { Link } from "expo-router";
import { Text, View, Pressable } from "react-native";

const SignUp = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Sign Up</Text>

      <Link href="/(auth)/sign-in" asChild>
        <Pressable className="mt-4 px-4 py-2 rounded bg-primary">
          <Text className="text-white">Already have account?</Text>
        </Pressable>
      </Link>
    </View>
  );
};

export default SignUp;